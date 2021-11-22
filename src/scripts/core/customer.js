/**
 *
 * TODO: Add confirmation messages for customer actions, e.g.
 * "Success, customer updated".
 */
var customer = new function() {

    var customerDbOnline = true;
    var firstNameInvalid = false;
    var lastNameInvalid = false;
    var emailInvalid = false;
    var phoneNoInvalid = false;
    var dobInvalid = false;

	var isDefined = function(object) {
        return object !== null && object !== undefined;
    };

    this.addUserPressed = function (e) {
        e.preventDefault();
        window.$Qmatic.components.card.addCustomerCard.showAddForm();
        window.$Qmatic.components.card.addCustomerCard.cle
        this.setFormButtonsState('#createCustomerForm', false);
        cardNavigationController.push(window.$Qmatic.components.card.addCustomerCard);
        setTimeout(function() {
            $('#addCustomerCard').focus();
        }, 500);
    };

    this.editUserPressed = function (e, index) {
        e.preventDefault();
        // if(moduleCustomerEnabled) {
            cardNavigationController.push(window.$Qmatic.components.card.editCustomerCard);
            this.populateEditAttachedCustomerFields("editAttached", index);
        // }
    }

    this.editAttachedCustomer = function (e) {
        e.preventDefault();
        this.editCustomer("editAttached", true);
    }

    this.navigateToCustomerOverview = function (e) {
        e.preventDefault();
        cardNavigationController.push(window.$Qmatic.components.card.customerListCard);
    }
    // Real
    this.populateAdditionalCustomersList = function () {
        var customerIds = sessvars.state.visit.customerIds.slice(0);
        customerIds.shift();
        var $customerList = $('.js-customer-list');
        $customerList.empty();
        var listItems = [];
        _.each(customerIds, function (customerId, i) {
            var customer = spService.get("customers/"+customerId);
            listItems.push(createCustomerListItem(customer.id, customer.firstName, customer.lastName, customer.properties.email, customer.properties.phoneNumber, customer.properties["dateOfBirth"], i+1));
        });
        $customerList.append(listItems);
    };

    var createCustomerListItem = function (id, firstName, lastName, email, phoneNumber, dateOfBirth, index) {
        var entry = document.createElement('LI');
        entry.classList.add('qm-customer-list__item');
        if(firstName && lastName) {
            var nameNode = document.createElement("P");
            nameNode.classList.add('qm-customer-list__name');
            var nameText = document.createTextNode(firstName + " " + lastName);
            nameNode.appendChild(nameText);
            entry.appendChild(nameNode);
        }
        if(email) {
            var emailNode = document.createElement("P");
            emailNode.classList.add('qm-customer-list__information');
            var emailText = document.createTextNode(email);
            emailNode.appendChild(emailText);
            entry.appendChild(emailNode);
        }
        if(phoneNumber) {
            var phoneNode = document.createElement("P");
            phoneNode.classList.add('qm-customer-list__information');
            var phoneText = document.createTextNode(phoneNumber);
            phoneNode.appendChild(phoneText);
            entry.appendChild(phoneNode);
        }
        if(dateOfBirth) {
            var dobNode = document.createElement("P");
            dobNode.classList.add('qm-customer-list__information');
            var dateOfBirthText = document.createTextNode(util.formatDateToDateConvention(dateOfBirth));
            dobNode.appendChild(dateOfBirthText);
            entry.appendChild(dobNode);
        }
        var editBtnNode = document.createElement("BUTTON");
        editBtnNode.onclick = function (e) {
            customer.editUserPressed(e, index);
        };
        editBtnNode.className += 'qm-action-btn qm-action-btn--only-icon qm-customer-list__edit-btn js-customer-edit-btn';
        var editIconNode = document.createElement("I");
        editIconNode.className += 'qm-action-btn__icon icon-edit';
        editIconNode.setAttribute('aria-hidden', true);
        editBtnNode.appendChild(editIconNode);
        var srSpan = document.createElement("SPAN");
        var srText = document.createTextNode(jQuery.i18n.prop('customer.edit') + " " + firstName + " " + lastName);
        srSpan.appendChild(srText);
        srSpan.classList.add('sr-only');
        editBtnNode.appendChild(srSpan);
        entry.appendChild(editBtnNode);
        return entry;
    }

    /*
        The locale identifier we get may contain a country identifier which may not exist among the
        supported date picker regions, so we need to try get by language identifier if a direct locale
        identifier match could not be made. Otherwise defaults to english date picker region.
        Example: User's locale could be fr-CA which is not supported by the date picker so we need to
                 try with "fr" instead.
    */
	var determineDatePickerRegion = function(localeIdentifier) {
	    var countryIdentifier,
	        languageMatch,
	        determinedRegion = ""; // Empty string gives English calendar translation

        if ( isDefined(localeIdentifier) && localeIdentifier !== "en") {

            if ($.datepicker.regional[localeIdentifier] === undefined) {
                // Checks both "_" and "-" just to be sure. Hyphen is from newer locale spec.
                languageMatch = /(\w+)[_-](\w+)/.exec(localeIdentifier);
                if (languageMatch !== null && languageMatch.length === 3 && $.datepicker.regional[languageMatch[1]] !== undefined) {
                    determinedRegion = languageMatch[1];
                }

            } else {
                determinedRegion = localeIdentifier;
            }
        }

        return determinedRegion;
	};

    this.init = function() {

        this.setFormButtonsState("#createCustomerForm", true);
        this.setFormButtonsState("#editCustomerForm", true);
        this.setFormButtonsState("#editAttachedCustomerForm", true);

        // this.setDOBOrder();

        this.initClearInputField();
        /*
         * Functionality below for autocomplete customer-search.
         * uses a simple input text field and jQuery datatable
         */
        $("#customerInput")
            .on("keydown", function(event) {
                // only process these events if we're in "search" mode
                if (document.getElementById('customerSearchDiv').style.display != "block") {
                    return;
                }
                var row = parseInt($(this).data('selectedRow'));
                var rowCount = parseInt($(this).data('rowCount'));
                // if(rowCount) {
                    // 
                // }
                // prevent using TAB key if we're in "search mode"
            
                if (event.keyCode === $.ui.keyCode.TAB) {
                  //  event.preventDefault();
                    // step up or down in the list
                } else if (event.keyCode === $.ui.keyCode.DOWN) {
                    row++;
                    if (row >= rowCount) {
                        row = rowCount - 1;
                    }
                    $(this).data('selectedRow', row);
                    customer.setSelectedRow(row, true);
                } else if (event.keyCode === $.ui.keyCode.UP) {
                    row--;
                    if (row <= 0) {
                        row = 0;
                    }
                    $(this).data('selectedRow', row);
                    customer.setSelectedRow(row, true);
                    // select the highlighted item
                } else if (event.keyCode === $.ui.keyCode.ENTER) {
                    customer.setSelectedCustomer(row);
                    util.hideModal('customerSearchDiv');
                }
            });

        $("#customerInput")
            .on("keyup", function(event) {
                var val = $(this).val();
                if (val) {
                    val = $.trim(val);
                }
                // these events are handled in "keydown" event handler
                if (event.keyCode === $.ui.keyCode.ENTER ||
                    event.keyCode === $.ui.keyCode.UP ||
                    event.keyCode === $.ui.keyCode.DOWN ||
                    event.keyCode === $.ui.keyCode.TAB) {

                    // cancel search
                } else if (event.keyCode === $.ui.keyCode.ESCAPE) {
                    // util.hideModal('customerSearchDiv');
                     event.preventDefault();
                    // return;
                } else {
                    // stop any timers running
                    var timer = $(this).data('timer');
                    if(timer) {
                        clearTimeout(timer);
                    }
                    if(val.length > 0) {
                        $('.js-search-input__icon').hide();
                        $('.qm-form-field--search .js-clear-field').show();
                    } else {
                        $('.js-search-input__icon').show();
                        $('.qm-form-field--search .js-clear-field').hide();
                    }

                    sessvars.currentCustomer = null;

                    if (val.length >= 2) { //We want at least 2 characters entered.
                        $(this).data('enteredVal', val); //Store the previous value on the autocomplete object.
                        $(this).data('selectedRow', 0); // reset which row has been selected
                        // start a timer to prevent searching "too fast"
                        $(this).data('timer', setTimeout(function() {
                            customer.filterList(val);
                            var rowCount = $('#customerSearchTable').dataTable().fnGetData().length;
                            if($('#noOfSearchResults').length == 0) {
                                $('#customerSearchTable').prepend("<p class='sr-only' aria-live='polite' id='noOfSearchResults'>" +  rowCount + ' ' + "customers found </p>");
                            } else {
                                $('#noOfSearchResults').text("");
                                setTimeout(function(){
                                    $('#noOfSearchResults').text( rowCount + ' ' +  "customers found");
                                }, 100);
                               
                            }
                            $("#customerInput").data('rowCount', rowCount);
                            if(customer.customerDbOnline) {
                            	util.showModal('customerSearchDiv');
                                customer.positionCustomerResult();
                                if (rowCount != 0) {
                                    customer.setSelectedRow(0, true);
                                }
    						}

                        },
                        300));
                        // less than 2 chars -> clear the table and hide it
                    } else {
                        $('#customerSearchTable').dataTable().fnClearTable();
                        window.$Qmatic.components.card.addCustomerCard.disableEditSave();
                        window.$Qmatic.components.card.addCustomerCard.clearEditForm();
                        window.$Qmatic.components.card.addCustomerCard.showAddForm();
                        util.hideModal('customerSearchDiv');
                    }
                }
            });

        this.escapeSearchMode = function (event) {
            var relatedTarget;
            //IE11 fix
            if (event.relatedTarget === null) {
                relatedTarget = document.activeElement;
            } else {
                relatedTarget = event.relatedTarget;
            }

            if ($(relatedTarget)[0] != $('.qm-form-field--search .js-clear-field')[0]) {
                setTimeout(function () {
                    $('#customerInput').val('');
                    util.hideModal('customerSearchDiv');
                    $('.js-search-input__icon').show();
                    $('.qm-form-field--search .js-clear-field').hide();
                },500);

            }
        }

        // column header definitions for the data table
        // read them from i18n to get the visible names
        this.COLUMN_NAMES = ["fullName", "phoneNumber", "email", "dateOfBirth"];
        var columnDefs = [];
        for (var i=0; i < customer.COLUMN_NAMES.length; i++) {
            var i18name = "field." + customer.COLUMN_NAMES[i];
            columnDefs.push({
                mDataProp: customer.COLUMN_NAMES[i],
                sTitle: '<span class="customerSearchHeader">' + jQuery.i18n.prop(i18name) + '</span>'
            });
        }
        var rowCallback = function(nRow, aData, iDisplayIndex) {
            var searchTerm = $("#customerInput").val();
            var replaceStr = searchTerm.replaceAll('(', '\\(');
            replaceStr = replaceStr.replaceAll(')', '\\)');
            replaceStr = replaceStr.replaceAll('+', '\\+');
            replaceStr = replaceStr.replaceAll('{', '\\{');
            replaceStr = replaceStr.replaceAll('}', '\\}');
            
            var pattern = new RegExp(replaceStr, "ig");
            $('td:eq(0)', nRow).html(aData.fullName.replace(pattern, "<span class='qm-table__highlight'>$&</span>"))
            $('td:eq(1)', nRow).html(aData.phoneNumber.replace(pattern, "<span class='qm-table__highlight'>$&</span>"))
            $('td:eq(2)', nRow).html(aData.email.replace(pattern, "<span class='qm-table__highlight'>$&</span>"))
            if (aData.dateOfBirth) {
                $('td:eq(3)', nRow).html(util.formatDateToDateConvention(aData.dateOfBirth))
            }
        }

        var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
            $(nHead).find('th').attr('scope', 'col');
        };

        // initialise datatable for the auto-complete customer search
        $("#customerSearchTable").dataTable({
            aaData : [],
            bLengthChange : false,
            bPaginate : false,
            bInfo : false,
            bFilter : false,
            sScrollX: "100%",
            autoWidth: true,
            bSort: false,
            asStripClasses: [],
            oLanguage: {
                sEmptyTable: jQuery.i18n.prop('customer.not.found')
            },
            aoColumns : columnDefs,
            fnRowCallback: rowCallback,
            fnHeaderCallback: headerCallback,
        });
        $('#customerSearchTable').prepend("<caption class='sr-only'>customer search</caption>");
     
      

        util.hideModal('customerSearchDiv');

    };

    this.handleShowResetButton = function ($inputs) {
        $inputs.on('keyup', function (e) {
            var $self = $(this),
                val = $self.val().trim();

            if(val.length > 0) {
                $self.next('.js-clear-field').show();
            } else {
                $self.next('.js-clear-field').hide();
            }
        })
    }

    this.setDOBOrder = function () {
        var dateConvention  = sessvars.systemInformation.dateConvention;
        var dobOrder = { month : 0, day : 1 , year : 2};
        var objArr = dateConvention.split('-');
          if (objArr.length !== 3) {
            objArr = dateConvention.split('/');
        }
        dobOrder.day = objArr.indexOf('DD');
        dobOrder.month = objArr.indexOf('MM');
        dobOrder.year = objArr.indexOf('YY');
        
        var month = document.getElementById("create-customer-month-container");
        month.style.order = dobOrder.month;
        var day = document.getElementById("create-customer-day-container");
        day.style.order = dobOrder.day;
        var year = document.getElementById("create-customer-year-container");
        year.style.order = dobOrder.year;

        var monthEdit = document.getElementById("edit-customer-month-container");
        monthEdit.style.order = dobOrder.month;
        var dayEdit = document.getElementById("edit-customer-day-container");
        dayEdit.style.order = dobOrder.day;
        var yearEdit = document.getElementById("edit-customer-year-container");
        yearEdit.style.order = dobOrder.year;

        var monthEditForm = document.getElementById("edit-form-customer-month-container");
        monthEditForm.style.order = dobOrder.month;
        var dayEditForm = document.getElementById("edit-form-customer-day-container");
        dayEditForm.style.order = dobOrder.day;
        var yearEditForm = document.getElementById("edit-form-customer-year-container");
        yearEditForm.style.order = dobOrder.year;
    }

    this.setFormButtonsState = function (formSelector, setListeners) {
        var $form = $(formSelector);
        var $inputs = $form.find('input');
        var $requiredFields = $form.find('[aria-required]');
        var $saveBtn = $form.find('.save-btn');
        var $emailField = $form.find('[name="email"]');
        var $phoneField = $form.find('input[type="tel"]');
        var $dobMonth = $form.find('[data-dobmonth]');
        var $dobDay = $form.find('[data-dobday]');
        var $dobYear = $form.find('[data-dobyear]');
        var dob = [$dobMonth, $dobDay, $dobYear];

        $saveBtn.prop('disabled', true);

        $form.find('.qm-field-error').removeClass('qm-field-error');
        this.setSaveButtonState($requiredFields, $saveBtn, $emailField, dob);
        if(setListeners) {
            this.setRequiredFieldsListener($requiredFields, $saveBtn, $emailField, $phoneField, dob);
            this.handleShowResetButton($inputs);
        }
    }

    this.setSaveButtonState = function ($requiredFields, $saveBtn, $emailField, dob) {
        var isValid = true;
        $.each($requiredFields, function (i, requiredField) {
            var $reqField = $(requiredField);
            toggleErrorLabel(false, $reqField, $saveBtn);
            if($reqField.val().trim() === "") {
                isValid = false;
            } else {
                $reqField.removeClass('qm-field-error');
            }
        });

        if(!isValid) {
            $saveBtn.prop('disabled', true);
        } else {
            $saveBtn.prop('disabled', false);
        }

        if($emailField.val() !== "" && !isEmailValid($emailField.val())) {
            $saveBtn.prop('disabled', true);
        } else {
            $emailField.removeClass('qm-field-error');
        }

    //    if(customer.validateDateOfBirth(dob, $saveBtn) !== true) {
    //         $saveBtn.prop('disabled', true);
    //     } else {
    //         toggleErrorLabel(false, dob[1], $saveBtn);
    //         this.hideDobFieldError(dob[0]);
    //         this.hideDobFieldError(dob[1]);
    //         this.hideDobFieldError(dob[2]);
    //     }
    };

    this.clearInput = function (e) {
        e.preventDefault();
        var $input = $(this).siblings('input');
        $input.val("");
        $input.trigger('keyup');
        $input.focus();
    }

    this.initClearInputField = function () {
        $clearBtns = $('.js-clear-field');
        $clearBtns.on('click', this.clearInput);
    }

    this.setSaveButtonStateWithError = function ($requiredFields, $saveBtn, $emailField, $phoneField, dob, $event) {
        var isFirstNameValid = false;
        var isLastNameValid = false;
        $.each($requiredFields, function (i, requiredField) {
            var $reqField = $(requiredField);
                if($reqField.val().trim() === "" && $reqField.hasClass('qm-touched')) {
                    if(i == 0){
                        isFirstNameValid = false;
                    }else if(i== 1){
                        isLastNameValid = false;
                    }
                    //if($reqField.parent().find(document.activeElement).length > 0){
                        $reqField.addClass('qm-field-error');
                        toggleErrorLabel(true, $reqField, $saveBtn);
                    //}    
                  }
                  else {
                    if(i == 0){
                        isFirstNameValid = true;
                    }else if(i== 1){
                        isLastNameValid = true;
                    }
                    if($reqField.parent().find(document.activeElement).length > 0){
                        toggleErrorLabel(false, $reqField, $saveBtn);
                        $reqField.removeClass('qm-field-error');
                    }   
                } 
  
        });
        if(isFirstNameValid && isLastNameValid) {
            $saveBtn.prop('disabled', false);
        } else {
            $saveBtn.prop('disabled', true);
        }

     


        if($emailField.val() !== "" && !isEmailValid($emailField.val())) {
            toggleErrorLabel(true, $emailField, $saveBtn);
            $emailField.addClass('qm-field-error');
            $saveBtn.prop('disabled', true);
          } else {
            toggleErrorLabel(false, $emailField, $saveBtn);
            $emailField.removeClass('qm-field-error');
        }

        var phonePattern = /^[0-9()s\+\s]+$/;
        var passedTest = phonePattern.test($phoneField.val());
        if (!passedTest) {
            if($phoneField.val().length > 0){
                toggleErrorLabel(true, $phoneField, $saveBtn);
                $phoneField.addClass('qm-field-error');
                $saveBtn.prop('disabled', true);
            }else{
                toggleErrorLabel(false, $phoneField, $saveBtn);
                $phoneField.removeClass('qm-field-error');
               // saveBtn.prop('disabled', false);
            }
        } else {
          toggleErrorLabel(false, $phoneField, $saveBtn);
          $phoneField.removeClass('qm-field-error');
         // saveBtn.prop('disabled', false);
        };

        // if(customer.validateDateOfBirth(dob, $saveBtn) !== true) {
        //     // toggleErrorLabel(true, dob[1]);
        //     $saveBtn.prop('disabled', true);
        // } else {
        //     toggleErrorLabel(false, dob[1], $saveBtn);
        //     this.hideDobFieldError(dob[0]);
        //     this.hideDobFieldError(dob[1]);
        //     this.hideDobFieldError(dob[2]);
        // }
    };

    var toggleErrorLabel = function (showError, $field, $saveBtn, errorMessage) {
        var fieldName = $field.prop('name');
        var $errorLabel = findErrorLabel($field);
        var $fieldLabel = findFieldLabel($field);

        switch (fieldName) {
            case 'firstName': {
                firstNameInvalid = showError || $field.prop('value') === "";
                var $requiredLabel = findRequiredLabel($field);
                showError ? $errorLabel.text(jQuery.i18n.prop('error.first.name.mandatory')) : $errorLabel.text('');
                showError ? ($fieldLabel.addClass('qm-form-field-label-error'), $requiredLabel.addClass('qm-required-label-error')) :
                 ($fieldLabel.removeClass('qm-form-field-label-error'), $requiredLabel.removeClass('qm-required-label-error'));
                break;
            }
            case 'lastName': {
                lastNameInvalid = showError || $field.prop('value') === "";
                var $requiredLabel = findRequiredLabel($field);
                showError ? $errorLabel.text(jQuery.i18n.prop('error.last.name.mandatory')) : $errorLabel.text('');
                showError ? ($fieldLabel.addClass('qm-form-field-label-error'), $requiredLabel.addClass('qm-required-label-error')) :
                 ($fieldLabel.removeClass('qm-form-field-label-error'), $requiredLabel.removeClass('qm-required-label-error'));
                break;
            }
            case 'email': {
                emailInvalid = showError;
                $field.closest('.qm-form-field').css("margin-bottom", "3rem");
                showError ? $errorLabel.text(jQuery.i18n.prop('error.validate.email.with.example')) : $errorLabel.text('');
                showError ? $fieldLabel.addClass('qm-form-field-label-error') : $fieldLabel.removeClass('qm-form-field-label-error');
                break;
            }
            case 'phoneNumber': {
                phoneNoInvalid = showError;
                $field.closest('.qm-form-field').css("margin-bottom", "3rem");
                showError ? $errorLabel.text(jQuery.i18n.prop('error.validate.phone.number')) : $errorLabel.text('');
                showError ? $fieldLabel.addClass('qm-form-field-label-error') : $fieldLabel.removeClass('qm-form-field-label-error');
                break;
            }
            case 'dobDay': {
                dobInvalid = showError;
                showError ?
                    (errorMessage ? $errorLabel.html(errorMessage) : $errorLabel.html(jQuery.i18n.prop('error.validate.dateOfBirth')))
                    : $errorLabel.html('');
                break;
            }
            default: {

            }
        }
        if (firstNameInvalid || lastNameInvalid || emailInvalid || phoneNoInvalid || dobInvalid) {
            $saveBtn.prop('disabled', true);
        } else {
            $saveBtn.prop('disabled', false);
        }
    }

    var findErrorLabel = function($formField) {
      return $formField.closest('.qm-form-field').find('.js-form-field-error');
    }

    var findFieldLabel = function ($formField) {
        return $formField.closest('.qm-form-field').find('.qm-form-field__label');
    }  

    var findRequiredLabel = function ($formField) {
        return $formField.closest('.qm-form-field').find('.qm-form-field__required-text');
    }  

    this.validateDateOfBirth = function (dob, $saveBtn) {
        var mm = dob[0].val();
        var dd = dob[1].val().trim();
        var yyyy = dob[2].val().trim();
        var hasStartedDob = false;
        var isValid = false;
        if (mm !== "-1" || dd !== '' || yyyy !== '') {
            hasStartedDob = true;
        } else {
            hasStartedDob = false;
        }

        if(hasStartedDob) {
            isValid = this.isValidDateOfBirth(dob, $saveBtn);
        } else {
            isValid = true;
        }

        return isValid;
    };

    this.isValidDateOfBirth = function (dob, $saveBtn) {
        var mm = dob[0].val();
        var dd = dob[1].val().trim();
        var yyyy = dob[2].val().trim();
        var inputDate = dd + '-' + mm + '-' + yyyy;

        var dateformat = /^(0?[1-9]|[12]\d|30|31)[\/\-](0?[1-9]|1[012])[\/\-]\d{4}$/;
        // Match the date format through regular expression
        if(inputDate.match(dateformat)) {
            var pdate = inputDate.split('-');

            var dd = parseInt(pdate[0]);
            var mm  = parseInt(pdate[1]);
            var yy = parseInt(pdate[2]);

            // Check if the date is in the future
            var now = new Date();
            // minus one from month because it's zero indexed
            var dobYear = new Date(yy, mm-1, dd);

            if (dobYear.getTime() > now.getTime()) {
                this.showDobFieldError(dob[2]);
                toggleErrorLabel(true, dob[1], $saveBtn, '<br>'+jQuery.i18n.prop('error.validate.dob.date.in.future'));
                return false;
            } else if ((yy+120 < now.getFullYear())){ // DoB < 120 years
                this.showDobFieldError(dob[2]);
                toggleErrorLabel(true, dob[1], $saveBtn, '<br>'+jQuery.i18n.prop('error.validate.dob.date.in.past'));
                return false;
            } else {
                this.hideDobFieldError(dob[2]);
            }

            // Create list of days of a month [assume there is no leap year by default]
            var ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];
            if (mm==1 || mm>2) {
                if (dd>ListofDays[mm-1]) {
                    // Faulty day
                    this.showDobFieldError(dob[1]);
                    toggleErrorLabel(true, dob[1], $saveBtn, '<br>'+translate.msg('error.validate.dob.invalid.day', [ListofDays[mm-1], util.getMonthName(mm-1)]));
                    return false;
                } else {
                    this.hideDobFieldError(dob[1]);
                }
            }
            if (mm==2) {
                var lyear = false;
                if ( (!(yy % 4) && yy % 100) || !(yy % 400)) {
                    lyear = true;
                }
                if ((lyear === false) && (dd>=29)) {
                    this.showDobFieldError(dob[1]);
                    toggleErrorLabel(true, dob[1], $saveBtn, '<br>'+translate.msg('error.validate.dob.invalid.day', [ListofDays[mm-1], util.getMonthName(mm-1)]));
                    return false;
                }
                if ((lyear === true) && (dd>29)) {
                    this.showDobFieldError(dob[1]);
                    toggleErrorLabel(true, dob[1], $saveBtn, '<br>'+translate.msg('error.validate.dob.invalid.day',[29, util.getMonthName(mm-1)]));
                    return false;
                }
                this.hideDobFieldError(dob[1]);
            }
        } else {
            var splitRegex = [/^(0?[1-9]|[12]\d|30|31)$/, /^(0?[1-9]|1[012])$/, /^\d{4}$/];
            var ListofDays = [31,28,31,30,31,30,31,31,30,31,30,31];
            var validDay = dd.match(splitRegex[0]);
            var validMonth = mm.match(splitRegex[1]);
            var validYear = yyyy.match(splitRegex[2]);
            var errorLabels = [];
            var errorString= '';

            if (validMonth) {
              this.hideDobFieldError(dob[0]);
            } else {
                if(validDay){
                    this.showDobFieldError(dob[0]);
                    errorString = errorString + ' <br> '+ translate.msg('error.validate.dob.invalid.month');
                }

            }
            if (validDay) {
              this.hideDobFieldError(dob[1]);
            } else {
              this.showDobFieldError(dob[1]);
              if(mm > 0){
                if(parseInt(dd)){
                    if (mm==2) {
                        var lyear = false;
                        if ( (!(yy % 4) && yy % 100) || !(yy % 400)) {
                            lyear = true;
                        }
                        if ((lyear === false) && (dd>=29)) {
                            errorString = errorString + ' <br> '+ translate.msg('error.validate.dob.invalid.day', [ListofDays[mm-1], util.getMonthName(mm-1)]);
                        }
                        if ((lyear === true) && (dd>29)) {
                            errorString = errorString + ' <br> '+ translate.msg('error.validate.dob.invalid.day', [29, util.getMonthName(mm-1)]);
                        }
                    }else{
                        errorString = errorString + ' <br> '+ translate.msg('error.validate.dob.invalid.day', [ListofDays[mm-1], util.getMonthName(mm-1)]);
                    }
                 }else{
                errorLabels.push(jQuery.i18n.prop('error.validate.dob.day'));
                 }
              }else{
                this.showDobFieldError(dob[0]);
                errorString = errorString + ' <br> '+ translate.msg('error.validate.dob.invalid.month');        
              }



            }
            if (validYear) {
              this.hideDobFieldError(dob[2]);
            } else {
              this.showDobFieldError(dob[2]);
              errorLabels.push(jQuery.i18n.prop('error.validate.dob.year'));
            }
            if (errorLabels.length > 0) {
              var shouldSeparate = errorLabels.length > 1;
              var message = errorLabels.reduce(function(combinedMessage, currentError, index, errorLabels) {
                if (index === errorLabels.length - 1) {
                  return combinedMessage + (shouldSeparate ? (" " + jQuery.i18n.prop('error.validate.dob.separator')) : "") + " " + currentError;
                } else if (shouldSeparate && index === errorLabels.length - 2) {
                  return combinedMessage + " " + currentError;
                } else {
                  return combinedMessage + " " + currentError + ","
                }
              }, jQuery.i18n.prop('error.validate.dob.invalid'));

            errorString = errorString + ' <br> '+ message;
            }
            if(errorString.length > 0){
                toggleErrorLabel(true, dob[1], $saveBtn, errorString);
            }else{
         
            }



            return false;
        }

        this.hideDobFieldError(dob[0]);
        this.hideDobFieldError(dob[1]);
        this.hideDobFieldError(dob[2]);

        return true;
    };

    this.showDobFieldError = function ($elem) {
        $elem.closest('.qm-form-field__input-container').find('.qm-form-field__label').addClass('qm-form-field-label-error');
        $elem.addClass('qm-field-error');
    };

    this.hideDobFieldError = function ($elem) {
        $elem.closest('.qm-form-field__input-container').find('.qm-form-field__label').removeClass('qm-form-field-label-error');
        $elem.removeClass('qm-field-error');
    };

    this.setRequiredFieldsListener = function ($requiredFields, $saveBtn, $emailField, $phoneField, dob) {
        var self = this;
        $requiredFields.on('blur', function() {
            $(this).addClass('qm-touched'); 
            self.setSaveButtonStateWithError.call(self, $requiredFields, $saveBtn, $emailField, $phoneField, dob);
        });
        $requiredFields.on('keyup keydown input', this.setSaveButtonStateWithError.bind(this, $requiredFields, $saveBtn, $emailField, $phoneField, dob));

        $emailField.on('keyup keydown input', this.setSaveButtonStateWithError.bind(this, $requiredFields, $saveBtn, $emailField, $phoneField, dob));
        $phoneField.on('keyup keydown input', this.setSaveButtonStateWithError.bind(this, $requiredFields, $saveBtn, $emailField, $phoneField, dob));

        if (dob.length > 0) {
            for(var i = 0; i < dob.length; i++) {
                dob[i].on('keyup keydown input', this.setSaveButtonStateWithError.bind(this, $requiredFields, $saveBtn, $emailField, $phoneField, dob));

            }
            dob[0].chosen().change(function () {
                customer.setSaveButtonStateWithError( $requiredFields, $saveBtn, $emailField, $phoneField, dob)
            });
        }
    }

    // the actual search function
    this.filterList = function(val) {
    	// QP-1285, IE caches things way too aggressively
    	var urlextra = "";
    	if (typeof lowfiie !== 'undefined' && lowfiie) {
    		urlextra = '&breakcache=' + Math.random();
    	}
        var prev = $(this).data('enteredVal');
        var $customerSearchTable = $('#customerSearchTable').dataTable();
        $customerSearchTable.fnClearTable();
        if(val !== prev) {

            if(val.indexOf("+") > -1) {
                val = encodeURIComponent(val);
            }

            var reqUrl = "/rest/servicepoint/customers/search?text=";
            if (compatibileHelper.advancedSearchCompatible(sessvars.systemInformation.productVersion)) {
                var searchOption = /\s/g.test(val) ? 'CONTAINS' : 'STARTS_WITH';
                reqUrl = "/rest/servicepoint/customers/advancedSearch?option=" + searchOption + "&text=";
            }

            $.ajax({
                url: reqUrl + val + urlextra,
                dataType: 'json',
                async: false,
                success: function(data){
                    customer.customerDbOnline = true;
                    $.map(data, function(item){
                        var transformedCustomer = transformCustomer(item, customer.COLUMN_NAMES);
                        $customerSearchTable.fnAddData(transformedCustomer);
                    });

                    window.$Qmatic.components.card.addCustomerCard.showAddForm();

                },
                error: function(jqXHR, textStatus, errorThrown) {
                    if(jqXHR.status == 503) {
                      customer.customerDbOnline = false;
                      util.showError(jQuery.i18n.prop('error.central.server.unavailable'));
                      util.hideModal("customerSearchDiv");
                    } else if (jqXHR.status == 400 && jqXHR.getResponseHeader('error_code') == '8135') {
                        util.showMessage(translate.msg('info.customerSearch.results.error'), true);
                    }
  			  }
            });
            // add click listener to select a customer if table is not empty
            if($customerSearchTable.fnGetData().length > 0) {
                $('#customerSearchTable tbody tr').click( function () {
                    var index = $customerSearchTable.fnGetPosition( this );
                    customer.setSelectedCustomer(index);
                    $('#customerSearchTable tbody tr').unbind();
                    // hide table
                    util.hideModal("customerSearchDiv");
                });
            }
            // add mouseover listener, to have the "selected" row follow the mouse pointer
            $('#customerSearchTable tbody tr').mouseover( function () {
                var index = $customerSearchTable.fnGetPosition( this );
                customer.setSelectedRow(index);
                $("#customerInput").data('selectedRow', index);
            });
            // bind loosing focus on the input field
            $("html").off('click');
            $("html").click( function(event) {
                // if we're in search mode, hide the window
                if (document.getElementById('customerSearchDiv').style.display == "block") {
                    util.hideModal("customerSearchDiv");
                }
            });
        }
    };

    /**
     * As of R5, we have a customer object with fixed fields for firstName, lastName, id and cardNumber. All other
     * fields goes into a properties map. This method transforms the "new" Customer object into a plain JS object with
     * all the fields in the properties map set directly as "normal" properties onto the JS object.
     *
     * @param item
     * @returns {___anonymous20437_20559}
     */
    var transformCustomer = function(item, columnNames) {
        // Add the declared fields
        var cust = {
            "fullName":item.firstName + " " + item.lastName,
            "firstName":item.firstName,
            "lastName":item.lastName,
            "cardNumber":item.cardNumber,
            "id":item.id
        };

        // Add the other properties
        var props = item.properties;
        for (var key in props) {
            if(props.hasOwnProperty(key)) {
                if( key === 'dateOfBirth' && props[key]) {
                    cust[key] = props[key].substring(0, 10);
                } else {
                    cust[key] = props[key];
                }
            }
        }

        // Finally, make sure all columns from columnNames are added to the customer object, otherwise, then table component will throw an error
        for(var a = 0; a < columnNames.length; a++) {
            if(typeof cust[columnNames[a]] === 'undefined' || cust[columnNames[a]] == null) {
                cust[columnNames[a]] = '';
            }
        }
        return cust;
    };

    // sets selected CSS style on one row
    this.setSelectedRow = function(index, scroll) {
        // clear all styles
        var doScroll = scroll ? true : false;
        $("#customerSearchTable tr").removeClass("row_selected");

        var rows = $("#customerSearchTable").dataTable().fnGetNodes();
        $(rows[index]).addClass('row_selected');
        // scroll to selected index if its outside the visible area
        // only do this if its called by the key listener, scrolling when mouseover is called makes it jump around
        if (doScroll) {
            if (index == 0) {
                document.getElementById("customerSearchDiv").scrollTop = 0;
            } else {
                var currentScroll = document.getElementById("customerSearchDiv").scrollTop;
                var totalHeight = document.getElementById("customerSearchDiv").scrollHeight;
                var currentHeight = parseInt($("#customerSearchDiv").css("height").replace("px", ""));
                if (totalHeight > currentHeight) {
                    var pxPerItem = (totalHeight) / (rows.length);
                    if ((pxPerItem * (index + 1 )) > (currentHeight / 2) ||
                        (pxPerItem * (index + 1)) < currentScroll) {
                        document.getElementById("customerSearchDiv").scrollTop = (pxPerItem * index) - (currentHeight/2);
                    }
                }
            }
        }
    };

    // sets the internal (sessvars) value for the selected customer, and prints the text in the input field
    this.setSelectedCustomer = function(index) {
        var searchCustomer = $('#customerSearchTable').dataTable().fnGetData(index);
        if (searchCustomer) {
            sessvars.currentCustomer = searchCustomer;
            $("#customerInput").value = searchCustomer.firstName + " " + searchCustomer.lastName;
            customer.updateSearchFieldText();
            //customer.updateCustomerModule();
            window.$Qmatic.components.card.addCustomerCard.clearEditForm();
            this.populateEditCustomerFields("edit");
            window.$Qmatic.components.card.addCustomerCard.showEditForm();
        }
    };

    this.setEditFields = function (prefix, customer) {
        for(var customerField in customer) {
            if(customer.hasOwnProperty(customerField)) {
                if(customerField == 'properties') {
                    // Iterate over all properties
                    var value;
                    for(var property in customer['properties']) {
                        if(customer['properties'].hasOwnProperty(property)) {
                            value = customer['properties'][property];
                            switch(property) {
                                case 'firstName':
                                case 'lastName':
                                case 'phoneNumber':
                                case 'email':
                                    $("#" + prefix + property).val(value);
                                    break;
                                case 'custom4':
                                    $("#" + prefix + 'captainId').val(value);
                                    break;
                                case 'dateOfBirth': {
                                    if(value) {
                                        var dob = value.split('-');
                                        var year = dob[0];
                                        var month = dob[1];
                                        var day = dob[2];
                                        $("#" + prefix + property + 'Month').val(month);
                                        $("#" + prefix + property + 'Month').trigger('chosen:updated');

                                        $("#" + prefix + property + 'Day').val(day.split('T')[0]);
                                        $("#" + prefix + property + 'Year').val(year);
                                    }
                                }
                                default:
                                    break;
                            }
                        }
                    }
                } else {
                    value = customer[customerField];
                    if(customerField != "id") {
                        try {
                            $("#" + prefix + customerField).val(value);
                        } finally {}
                    }
                }
            }
        }
    }

    this.populateEditAttachedCustomerFields = function (prefix, index) {
        if(typeof sessvars.state.visit !== "undefined" && sessvars.state.visit.customerIds != null && sessvars.state.visit.customerIds.length > 0) {
            // clear form to not have old values in there
            $('#' + prefix + 'CustomerForm input').val("");
            //customer might have been updated elsewhere, fetch from database before display
            var customerId = sessvars.state.visit.customerIds[index]
            sessvars.currentCustomer = spService.get("customers/"+customerId);

            this.setEditFields(prefix, sessvars.currentCustomer)
            this.setFormButtonsState('#' + prefix + 'CustomerForm', false);
        } else if (typeof sessvars.state.visit !== "undefined" && typeof sessvars.state.visit.parameterMap.customers !== "undefined") {
            var firstName;
            var lastName;
            if (sessvars.state.visit.parameterMap.primaryCustomerFirstName !== undefined || sessvars.state.visit.parameterMap.primaryCustomerLastName !== undefined) {
                firstName = sessvars.state.visit.parameterMap.primaryCustomerFirstName;
                lastName = sessvars.state.visit.parameterMap.primaryCustomerLastName
            } else {
                var customerName = sessvars.state.visit.parameterMap.customers;
                var namePart = customerName.split(' ');
                firstName = namePart[0];
                namePart.shift();
                lastName = namePart.join(' ');
            }
            var tempCustomer = {    firstName : firstName,
                                    lastName : lastName,
                                    properties : {
                                        email : sessvars.state.visit.parameterMap.primaryCustomerEmail !== undefined ? sessvars.state.visit.parameterMap.primaryCustomerEmail : sessvars.state.visit.parameterMap.email,
                                        phoneNumber : sessvars.state.visit.parameterMap.primaryCustomerPhoneNumber !== undefined ? sessvars.state.visit.parameterMap.primaryCustomerPhoneNumber : sessvars.state.visit.parameterMap.phoneNumber,
                                        dateOfBirth : sessvars.state.visit.parameterMap.primaryCustomerDateOfBirth
                                    }
                                }
            sessvars.currentCustomer = tempCustomer;
            this.setEditFields(prefix, sessvars.currentCustomer)
            this.setFormButtonsState('#' + prefix + 'CustomerForm', false);
        }
    }

    this.populateEditCustomerFields = function (prefix) {
        if(typeof sessvars.currentCustomer !== "undefined" && sessvars.currentCustomer != null) {
            // clear form to not have old values in there
            $('#' + prefix + 'CustomerForm input').val("");
            //customer might have been updated elsewhere, fetch from database before display
            var params = {customerId : parseInt(sessvars.currentCustomer.id)};
            sessvars.currentCustomer = spService.get("customers/"+sessvars.currentCustomer.id);

            this.setEditFields(prefix, sessvars.currentCustomer);
            this.setFormButtonsState('#' + prefix + 'CustomerForm', false);
            //window.$Qmatic.components.card.addCustomerCard.enableEditSave();
        }
    }

    this.editAndLink = function (e) {
        e.preventDefault();
        var prefix = "edit";
        var formName = "editCustomerForm";
        this.editAndSaveCustomer(prefix, formName);
        cardNavigationController.pop();
    }

    this.editAndSaveCustomer = function (prefix, formName) {
        var isUpdated = this.determineIfCustomerUpdated(formName);

        if(isUpdated) {
             this.editCustomer(prefix, false);
        }
        this.linkCustomerPressed();
    }

    this.determineIfCustomerUpdated = function (formName) {
        var serializedForm = $("#" + formName + ' :input').serializeArray();
        // var serializedForm = $('#editCustomerForm :input').serializeArray();
        var isUpdated = false;

        for(var i = 0; i < serializedForm.length; i++) {
            var field = serializedForm[i];
            if((field.name === 'firstName' || field.name === 'lastName') && sessvars.currentCustomer[field.name] !== field.value) {
                isUpdated = true;
                break;
            } else if ((field.name === 'email' || field.name === 'phoneNumber' || field.name === 'dobMonth' || field.name === 'dobDay' || field.name === 'dobYear') && sessvars.currentCustomer.properties[field.name] !== field.value) {
                isUpdated = true;
                break;
            }
        }
        return isUpdated;
    }

    this.setAmountOfAdditionalCustomers = function () {
        var $amountOfAdditionalCustomers = $('#amountOfAdditionalCustomers');

        if(typeof sessvars.state.visit !== "undefined" && sessvars.state.visit != null &&
            sessvars.state.visit.customerIds != null && sessvars.state.visit.customerIds.length > 1) {
                $amountOfAdditionalCustomers.text("+" + (sessvars.state.visit.customerIds.length - 1));
                $amountOfAdditionalCustomers.css("display", "");
        } else {
            $amountOfAdditionalCustomers.empty();
            $amountOfAdditionalCustomers.hide();
        }
    };

    this.saveAndLinkCustomer = function(e) {
        e.preventDefault();
        if(servicePoint.hasValidSettings() && sessvars.state.userState == servicePoint.userState.SERVING) {
            var parameterizedCustomer = parameterizeCustomer("createCustomerForm");
            if(validateCustomerForm(parameterizedCustomer.$entity)) {

                var createdCustomer = createCustomer(parameterizedCustomer);
                if(typeof createdCustomer !== "undefined") {
                    //validation ok, all fields nice and proper
                    linkCustomer(createdCustomer);

                    //$("#linkedCustomerField").html(createdCustomer.firstName + " " + createdCustomer.lastName);
                    this.setAmountOfAdditionalCustomers();
                    $('#ticketNumber').removeClass('qm-card-header__highlighted');
                    //cleanCustomerForm("create");
                    window.$Qmatic.components.card.addCustomerCard.clearAddForm();
                    cardNavigationController.pop();
                }
            }
        }
    };

    this.editCustomer = function(prefix, shouldPop) {
        var customerParameterized = parameterizeCustomer(prefix + "CustomerForm");
        if(validateCustomerForm(customerParameterized.$entity)) {

            customerParameterized.customerId = sessvars.currentCustomer.id;

            if (sessvars.currentCustomer.id !== undefined) {
                var params = servicePoint.createParams();
                params.json =jsonString(customerParameterized);
                console.log(params);
                spService.putParams("customers/"+customerParameterized.customerId, params);

                //update current customer i.e. the selected customer, NOT the linked customer
                sessvars.currentCustomer = customerParameterized.$entity;
                sessvars.currentCustomer.id = customerParameterized.customerId;

                //update linked customer field if the customer is linked to the current transaction
                var $linkedCustomerField = $("#linkedCustomerField");
                if(servicePoint.hasValidSettings(false) && sessvars.state.userState == servicePoint.userState.SERVING &&
                    typeof sessvars.state.visit !== "undefined" && sessvars.state.visit != null &&
                    sessvars.state.visit.customerIds != null && sessvars.state.visit.customerIds.length > 0 &&
                    sessvars.state.visit.customerIds[0] == customerParameterized.customerId) {
                        $linkedCustomerField.html(customerParameterized.$entity.firstName + " " + customerParameterized.$entity.lastName);
                        $linkedCustomerField.css("display", "");
                        this.setAmountOfAdditionalCustomers();
                        $('#ticketNumber').removeClass('qm-card-header__highlighted');
                } else {
                    // $linkedCustomerField.hide();
                }
                if(shouldPop === true) {
                    if(sessvars.state.visit.customerIds[0] === sessvars.currentCustomer.id) {
                        var updateParams = servicePoint.createParams();
                        updateParams.customerId = sessvars.currentCustomer.id;
                        updateParams.visitId = sessvars.state.visit.id;
                        updateParams.json = '{"customers":"' + customerParameterized.$entity.firstName + ' ' + customerParameterized.$entity.lastName + '"}';
                        spService.putParams("branches/" + params.branchId + "/visits/" + sessvars.state.visit.id + "/parameters", updateParams);
                    }

                    cardNavigationController.pop();
                }
            } else if (typeof sessvars.state.visit !== "undefined" && typeof sessvars.state.visit.parameterMap.customers !== "undefined") {
                var dob = "";
                if (customerParameterized.$entity.properties.dobYear) {
                    dob = new Date(customerParameterized.$entity.properties.dobYear + '-' + customerParameterized.$entity.properties.dobMonth + '-' + customerParameterized.$entity.properties.dobDay);
                }
                var tempCustomer = {    customers : customerParameterized.$entity.firstName + ' ' + customerParameterized.$entity.lastName,
                                        email : customerParameterized.$entity.properties.email,
                                        phoneNumber : customerParameterized.$entity.properties.phoneNumber,
                                        dateOfBirth : customerParameterized.$entity.properties.dateOfBirth,
                                        primaryCustomerFirstName : customerParameterized.$entity.firstName,
                                        primaryCustomerLastName : customerParameterized.$entity.lastName,
                                        primaryCustomerEmail : customerParameterized.$entity.properties.email,
                                        primaryCustomerPhoneNumber : customerParameterized.$entity.properties.phoneNumber,
                                        primaryCustomerDateOfBirth : dob,
                }
                var updateParams = {};
                updateParams.json = JSON.stringify(tempCustomer);
                sessvars.state.visit = spService.putParams("branches/" + sessvars.state.branchId + "/visits/" + sessvars.state.visit.id + "/parameters", updateParams);

                $linkedCustomerField = $("#linkedCustomerField");
                $linkedCustomerField.html(tempCustomer.customers);
                $linkedCustomerField.css("display", "");

                cardNavigationController.pop();
            }
        }
    };

    //util functions

    var parameterizeCustomer = function(formName) {
        var customerArray = $("#" + formName + ' :input').serializeArray();
        var customerParameterized = {};
        var properties = {};
        customerParameterized.properties = properties;
        for(var i = 0; i < customerArray.length; i++) {
            if(customerArray[i].name == "firstName" || customerArray[i].name == "lastName" ||
                customerArray[i].name == "id" || customerArray[i].name == "cardNumber") {
                customerParameterized[customerArray[i].name] = customerArray[i].value;
            } else {
                // First, a little special "hack" for the gender select.
                // if(customerArray[i].name == "gender" && customerArray[i].value == -1) {
                //     customerParameterized.properties[customerArray[i].name] = "";
                //     continue;
                // }
                customerParameterized.properties[customerArray[i].name] = customerArray[i].value;
            }
		}
        return {"$entity" : customerParameterized};
    };

    var createCustomer = function(parameterizedCustomer) {
		var params = servicePoint.createParams();
        params.json = jsonString(parameterizedCustomer);

		return spService.postParams("customers", params);
    };

    var shouldIncludeDob = function (prop) {
        return prop["dobMonth"] !== "-1" || prop["dobDay"] !== '' || prop["dobYear"] !== '' ? true : false;
    }

    var jsonString = function (val) {
		var main = val.$entity;
        var prop = val.$entity.properties;
        var includeDob = false; shouldIncludeDob(prop);

        var j = '{';
            j += '"firstName":"' + main.firstName + '","lastName":"' + main.lastName + '"'
        if (includeDob === true) {
            j +=',"properties":{"phoneNumber":"' + prop.phoneNumber + '","email":"' + prop.email + '", "dateOfBirth":"' + prop.dobYear + '-' + prop.dobMonth + '-' + prop.dobDay + '"}}';
        } else {
            j +=',"properties":{"phoneNumber":"' + prop.phoneNumber + '","email":"' + prop.email + '", "custom3": "' + prop.captainId + " - " + prop.phoneNumber + '", "custom4": "' + prop.captainId + '"}}';
        }

		return j;
    }

    //link customer stuff below

    var linkCustomer = function(customer) {
        var params = servicePoint.createParams();
        params.customerId = customer.id;
        params.visitId = sessvars.state.visit.id;
        params.json = '{"customers":"' + customer.firstName + " " + customer.lastName + '"}';
        sessvars.state = servicePoint.getState(spService.putCallback("branches/" + params.branchId + "/visits/" + params.visitId + "/customers/" + params.customerId));
        if(isFirstCustomerLinked()) {
            spService.putParams("branches/" + params.branchId + "/visits/" + params.visitId + "/parameters", params);
        }
        sessvars.statusUpdated = new Date();
        servicePoint.updateWorkstationStatus(false, true);
    };

    this.linkCustomerPressed = function() {
        if(servicePoint.hasValidSettings() && sessvars.state.userState == servicePoint.userState.SERVING) {
            if(typeof sessvars.currentCustomer !== "undefined" && sessvars.currentCustomer != null &&
                typeof sessvars.currentCustomer.id !== "undefined" && sessvars.currentCustomer.id != null &&
                typeof sessvars.currentCustomer.id === 'number') {
                linkCustomer(sessvars.currentCustomer);
                if(isFirstCustomerLinked()) {
                    $linkedCustomerField = $("#linkedCustomerField");
                    $linkedCustomerField.html(sessvars.currentCustomer.firstName + " " + sessvars.currentCustomer.lastName);
                    $linkedCustomerField.css("display", "");
                }
                this.setAmountOfAdditionalCustomers();
                $('#ticketNumber').removeClass('qm-card-header__highlighted');
                sessvars.currentCustomer = null;
                //customer.updateCustomerModule();
            }
        }
    };

    var isFirstCustomerLinked = function () {
        if(sessvars.state
            && sessvars.state.visit
            && sessvars.state.visit.customerIds
            && sessvars.state.visit.customerIds.length === 1) {
                return true;
        }
        return false;
    };

    this.updateSearchFieldText = function () {
        if(typeof sessvars.currentCustomer !== "undefined" && sessvars.currentCustomer != null) {
            $("#customerInput").val(sessvars.currentCustomer.firstName + " " +
                                    sessvars.currentCustomer.lastName);
        }
    }

    // this.updateCustomerModule = function() {
    //     $("#createCustomerLink").addClass("newCust customLink");
    //     $("#createCustomerLink").prop('disabled', false);
    //     if(typeof sessvars.currentCustomer !== "undefined" && sessvars.currentCustomer != null) {
    //         $("#customerInput").val(sessvars.currentCustomer.firstName + " " +
    //             sessvars.currentCustomer.lastName);
    //         $("#editCustomerLink").removeClass("customLinkDisabled").addClass("editCust customLink");
    //         $("#editCustomerLink").prop('disabled', false);
    //         if(servicePoint.hasValidSettings() && sessvars.state.userState == servicePoint.userState.SERVING) {
    //             $("#linkCustomerLink").removeClass("customLinkDisabled").addClass("linkCust customLink");
    //             $("#linkCustomerLink").prop('disabled', false);
    //         }
    //         $("#deleteCustomerLink").removeClass("customLinkDisabled").addClass("deleteCust customLink");
    //         $("#deleteCustomerLink").prop('disabled', false);
    //         return;
    //     }
    //     $("#customerInput").val("");
    //     $("#editCustomerLink").removeClass("customLink").addClass("editCust customLinkDisabled");
    //     $("#editCustomerLink").prop('disabled', true);
    //     $("#linkCustomerLink").removeClass("customLink").addClass("linkCust customLinkDisabled");
    //     $("#linkCustomerLink").prop('disabled', true);
    //     $("#deleteCustomerLink").removeClass("customLink").addClass("deleteCust customLinkDisabled");
    //     $("#deleteCustomerLink").prop('disabled', true);
    // };

    this.updateCustomer = function() {
        if((sessvars.state.userState == servicePoint.userState.SERVING || sessvars.state.userState == servicePoint.userState.WRAPUP) && typeof sessvars.state.visit !== "undefined" &&
            sessvars.state.visit != null) {
            if(sessvars.state.visit.parameterMap != null &&
                typeof sessvars.state.visit.parameterMap.customers != 'undefined' &&
                sessvars.state.visit.parameterMap.customers != null &&
                sessvars.state.visit.parameterMap.customers != "") {
                var $linkedCustomerField = $("#linkedCustomerField");
                $linkedCustomerField.html(sessvars.state.visit.parameterMap.customers);
                $linkedCustomerField.css("display", "");
                this.setAmountOfAdditionalCustomers();
                $('#ticketNumber').removeClass('qm-card-header__highlighted');

            } else if(typeof sessvars.state.visit.customerIds !== "undefined" &&
                sessvars.state.visit.customerIds != null && sessvars.state.visit.customerIds.length > 0) {
                var customer =spService.get("customers/"+sessvars.state.visit.customerIds[0]);
                var $linkedCustomerField = $("#linkedCustomerField");
                $linkedCustomerField.html(customer.firstName + " " + customer.lastName);
                $linkedCustomerField.css("display", "");
                this.setAmountOfAdditionalCustomers();
                $('#ticketNumber').removeClass('qm-card-header__highlighted');
            } else {
                $("#ticketNumber").addClass("qm-card-header__highlighted");
                this.setAmountOfAdditionalCustomers();
            }
        }
    };

    var validateCustomerForm = function(customer) {
        var validationError = "";
        var error = false;
        if(customer.firstName == null || customer.firstName == "") {
            error = true;
            validationError = jQuery.i18n.prop('error.first.name.mandatory');
        }
        if(customer.lastName == null || customer.lastName == "") {
            error = true;
            if(validationError == "") {
                validationError = jQuery.i18n.prop('error.last.name.mandatory');
            } else {
                validationError += ", " + jQuery.i18n.prop('error.last.name.mandatory');
            }
        }
        if(!isEmailValid(customer.properties.email)) {
            error = true;
            if(validationError == "") {
                validationError = jQuery.i18n.prop('error.validate.email');
            }
            else {
                validationError += ", " + jQuery.i18n.prop('error.validate.email');
            }
        }

        if(error) {
            util.showError(validationError);
            return false;
        }
        return true;
    };

    // position the search box (this is also used when updating the queues)
    this.positionCustomerResult = function() {
        $("#customerSearchDiv")
            .css("minWidth", $('#customerInput').outerWidth(), "width", $('#customerSearchTable').outerWidth())
            .position({
                my: "left top",
                at: "left bottom",
                of: $("#customerInput")
            });
    };

    var isEmailValid = function(emailString) {
        // Don't validate empty Strings - those are OK
        if (emailString == null || emailString == "") {
            return true;
        }

        // var p = new RegExp(".+@.+\\.[a-z]+");
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailString);
    };
};

