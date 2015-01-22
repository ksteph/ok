
app.controller("CourseSelectorController", ["$scope", "$window", "$state", '$stateParams', 'Course',
    function ($scope, $window, $state, $stateParams, Course) {
      Course.get(function(response) {
        $scope.courses = response.results
        // TODO : Remove
        console.log($scope.courses)
      });
      if ($window.user.indexOf("berkeley.edu") == -1) {
        $window.swal({
            title: "Is this the right login?",
            text: "Logging you in with your \"" + $window.userEmail + "\" account...",
            type: "info",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes - that's correct!",
            cancelButtonText: "No - log me out",
            closeOnConfirm: true,
            closeOnCancel: true
        }, function(isConfirm) {
            if (isConfirm) {
              // Do nothing, because the user might want to select a course.
            } else {
                $window.location.href = $window.reloginLink;
            }
        });
      } else {
         $window.location.hash = "";
      }
    }
]);

// Assignment Controllers
app.controller("AssignmentOverviewController", ['$scope', 'Assignment', 'User', '$timeout',
  function($scope, Assignment, User, $timeout) {
    Assignment.query(function(response) {
      $scope.assignments = response.results;
    })}
]);

// Assignment Controllers
app.controller("GroupOverviewController", ['$scope', 'Assignment', 'User', '$timeout',
  function($scope, Assignment, User, $timeout) {
    Group.query(function(response) {
      $scope.assignments = response.results;
    })}
]);


// Eeek.
app.controller("AssignmentDashController", ['$scope', 'Assignment', 'User', 'Group', '$timeout',
  function($scope, Assignment, User, Group, $timeout) {
    $scope.courseId = 5699868278390784;
      User.get({
        course: 5699868278390784,
      }, function (response) {
        $scope.assignments = response.assignments

        $scope.currGroupMembers = ['Alvin', 'Angie']

        $scope.removeMember = function(member) {
              Group.removeMember({
                member: member.key,
                id: $scope.currGroup.id
              }, function (err) {
                if ($scope.currGroupMembers.length == 2) {
                  $scope.currGroupMembers = []
                  //$scope.currAssign.group = []
                }
                // TODO: Change the assignment group.
                membersArr = []
                ind = membersArr.indexOf(member)
                if (ind != -1) {
                  membersArr.splice(ind, 1);
                }
                $scope.hidePopups();
              });
        };

        $scope.addMember = function(assign, member) {
          if ($scope.currGroupMembers.length == 0 && member != '') {
            Group.addMember({
              member: member,
              id: $scope.group.id
            }, function (response) {
              // TODO  Check for error.
              $scope.currGroupMembers.push(member+'(invited)')
            });
          }
        };

        $scope.showGroup = function showGroup(id) {
            $('.popups').addClass('active');
            $('.popup').removeClass('active');
            $('.popup.group').addClass('active').removeClass('hide');
            $( ".sortable" ).sortable();
        }

        $scope.hideGroup = function hideGroup(id) {
            $('.popups').addClass('active');
            $('.popup').removeClass('active');
            $('.popup.group').addClass('active').removeClass('hide');
            $( ".sortable" ).sortable();
        }

        $scope.showBackups = function showGroup(id) {
            $('.popups').addClass('active');
            $('.popup').removeClass('active');
            $('.popup.backups').addClass('active').removeClass('hide');
        }

        $scope.showSubms = function showGroup(id) {
            $('.popups').addClass('active');
            $('.popup').removeClass('active');
            $('.popup.submissions').addClass('active').removeClass('hide');
        }

        $scope.hidePopups =  function hidePopups() {
            $('.assign').removeClass('s');
            $('.popups').removeClass('active');
            $('.popup').removeClass('active');
            setTimeout(function() {
              $('.popup').addClass('hide');
            },400);
          }

        $scope.showLoader = function showLoader() {
          $('.loader').removeClass('hide');
        }

        $scope.hideLoader = function hideLoader() {
          $('.loader').addClass('done hide');
          setTimeout(function() {
            $('.loader').removeClass('done')
          },800)
        }

      })
    }
]);

// Group Controllers
app.controller("GroupController", ["$scope", "$stateParams", "$window", "$timeout", "Group",
    function ($scope, $stateParams, $window, $timeout, Group) {
      $scope.loadGroup = function() {
        Group.query({
            assignment: $stateParams.assignmentId,
            members: $window.user
          }, function(groups) {
            if (groups.length == 1) {
              $scope.group = groups[0];
              $scope.inGroup = true;
            } else {
              $scope.group = undefined;
              $scope.inGroup = false;
            }
          }
        );
      }
      $scope.refreshGroup = function() {
          $timeout(function() {
            $scope.loadGroup();
          }, 300);
      }
      $scope.loadGroup();
      $scope.createGroup = function() {
        Group.save({
          assignment: $stateParams.assignmentId,
          members: $window.user
        }, $scope.refreshGroup);
      }
    }
  ]);

app.controller("MemberController", ["$scope", "$modal", "Group",
    function ($scope, $modal, Group) {
      $scope.remove = function() {
          Group.removeMember({
            member: $scope.member.email,
            id: $scope.group.id
          }, $scope.refreshGroup);
        }
    }
]);

app.controller("AddMemberController", ["$scope", "$stateParams", "$window", "$timeout", "Group",
    function ($scope, $stateParams, $window, $timeout, Group) {
      $scope.add = function() {
        if ($scope.newMember != "") {
          Group.addMember({
            member: $scope.newMember,
            id: $scope.group.id
          }, $scope.refreshGroup);
        }
      }
    }
  ]);

app.controller("InvitationsController", ["$scope", "$stateParams", "$window", "$timeout", "User", "Group",
    function ($scope, $stateParams, $window, $timeout, User, Group) {
      $scope.invitations = User.invitations({
        assignment: $stateParams.assignmentId
      });

      $scope.refreshInvitations = function() {
          $timeout(function() {
            $scope.invitations = User.invitations({
              assignment: $stateParams.assignmentId
            });
          }, 300);
      }

      $scope.accept = function(invitation, $event) {
        $event.stopPropagation();
        if ($scope.inGroup === false) {
          Group.acceptInvitation({
            id: invitation.id
          }, function() {
            $scope.refreshInvitations();
            $scope.refreshGroup();
          });
        } else {
        }
      }

      $scope.reject = function(invitation, $event) {
        $event.stopPropagation();
        Group.rejectInvitation({
          id: invitation.id
        }, $scope.refreshInvitations);
      }
    }
  ]);

