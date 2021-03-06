(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('InputTypeService', Service);
 
    function Service() {
        var service = {};
 
        service.showInputTypes = showInputTypes;
        service.arrayRemove = arrayRemove;
        service.formatDate = formatDate;
        service.pushToAllEntry = pushToAllEntry;
        service.isChecked = isChecked;
        service.declareSelected = declareSelected;
 
        return service;
 
        /*
            Function name: 
            Author(s): 
            Date Modified: 
            Description: 
            Parameter(s): 
            Return: 


        */
        function showInputTypes(data) {
            switch (data){
                case "text":
                case "number":
                case "email":
                case "password":
                    return true;
                    break;
                default:
                    return false;
                    break
                
            }
        }

        function arrayRemove() {
            var what, a = arguments, L = a.length, ax;
            while (L && this.length) {
                what = a[--L];
                while ((ax = this.indexOf(what)) !== -1) {
                    this.splice(ax, 1);
                }
            }
            return this;
        }

        /*
            Function name: Format date
            Author(s): Flamiano, Glenn
            Date Modified: 2018/01/25
            Description: To iformat a date and to be inserted to $scope.aDevices
            Parameter(s): none
            Return: formatted date
        */
        function formatDate(date) {
            console.log(date);
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            console.log([year, month, day].join('-'));
            return [year, month, day].join('-');
        }

        function pushToAllEntry(fieldName, option, selected) {
            var checkedOption = document.getElementsByName(option);
            if(checkedOption[0].checked){
                selected['checkBoxAdd '+fieldName].push(option);
            }else{
                selected['checkBoxAdd '+fieldName].remove(option);
            }

            return selected['checkBoxAdd '+fieldName];
        }

        function isChecked(field_name, option, allEntry) {
            if(allEntry[field_name] == undefined) allEntry[field_name] = [];
            var isChecked = (allEntry[field_name].indexOf(option) != -1) ? true : false;
            return isChecked;
        }

        function declareSelected(selected, checkboxFields, selectedLength) {
            checkboxFields = document.getElementsByName("checkBoxInput");
            for(var i=0;i<checkboxFields.length;i++){
                selected[checkboxFields[i].className] = [];
                selectedLength++;
            }

            var select = {
                selected: selected,
                selectedLength: selectedLength
            }

            return select;
        }

        }        
 
})();