var table = ''; // Variable in global scope to store the data table instance

if ( $.fn.dataTable.isDataTable( '#data-table' ) ) {
    table.destroy();  // Destroy old instance
}

$scope.json = data.data;  // Get json data with angular $http service

var target = $('#data-table thead');  // Data table thead
var target2 = $('#data-table tbody'); // Data table tbody
target.remove();  // Remove thead
target2.remove(); // Remove tbody
target = target2 = $(); // 'remove' only removes from DOM, not the object, so replace with empty object
$http.post('templates/table.tpl.html').success(function(data){  // Get table thead & tbody template again
   angular.element('#data-table').injector().invoke(function($compile) {  // Compile the template html
        var $scope = angular.element('#data-table').scope();
        $('#data-table').append($compile(data)($scope));  // Append compiled html to table
        angular.element('#data-table').ready(function(){
            setTimeout(function(){  // Give some miliseconds to generate/ready the html
                table=$('#data-table').DataTable({  // Reinitialize data table
                            responsive: true
                        });
            },100);
        });
    });
});