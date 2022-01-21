var transfer = new function () {
    var transferTable;
    var transferToStaffPoolTable;
    var transferToServicePointPoolTable;

    var transferTicketToQueueTable;
    var transferQueueToStaffPoolTable;
    var transferQueueToServicePointPoolTable;

    this.transferPressed = function () {

        if (!servicePoint.checkCaptainId()) {
            return;
        }

        if (!enableAutoTransfer) {

            if (transferToQueueEnabled
                && transferToUserPoolEnabled === false
                && transferToServicePointPoolEnabled === false) {
                transfer.navigateToQueueView();
            } else if (transferToUserPoolEnabled
                && transferToQueueEnabled === false
                && transferToServicePointPoolEnabled === false) {
                transfer.navigateToUserPoolView();
            } else if (transferToServicePointPoolEnabled
                && transferToUserPoolEnabled === false
                && transferToQueueEnabled === false) {
                transfer.navigateToCounterPoolView();
            } else {
                cardNavigationController.push($Qmatic.components.card.transferOptionsCard);
            }

            if (transferToQueueEnabled) {
                $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToQueue').attr('style', '');
            } else {
                $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToQueue').css('display', 'none');
            }
            if (transferToUserPoolEnabled) {
                $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToUserPool').attr('style', '');
            } else {
                $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToUserPool').css('display', 'none');
            }
            if (transferToServicePointPoolEnabled) {
                $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToCounterPool').attr('style', '');
            } else {
                $($Qmatic.components.card.transferOptionsCard.getSelector()).find('.js-transferToCounterPool').css('display', 'none');
            }

        } else {

            // auto transfer based on the rules
            var queues = spService.get("branches/" + sessvars.branchId + "/queues");
            if (sessvars.state.visit && queues && queues.length) {
                var currentQ = localStorage.getItem("CurrentQ");
                if (currentQ) {
                    var rules = JSON.parse(autoTransferRules);
                    var targetQName = rules[currentQ];
                    if (targetQName) {

                        for (var i = 0; i < queues.length; i++) {
                            if (queues[i].name == targetQName) {

                                var aData = {
                                    id: queues[i].id,
                                    name: queues[i].name
                                };
                                transferCurrentVisitToQueueClicked("LAST", aData);

                                break;
                            }
                        }

                    } else {
                        util.showMessage('No transfer rule found for ' + currentQ, true);
                    }
                }
            }
        }

    }

    this._transferCurrentVisitToQueueClicked = function (sortType, rowData, delay) {
        if (sessvars.state.userState == servicePoint.userState.SERVING) {
            var transferParams = servicePoint.createParams();
            transferParams.queueId = rowData.id;
            transferParams.$entity = {
                "fromId": sessvars.servicePointId,
                "fromBranchId": sessvars.branchId,
                "visitId": sessvars.state.visit.id
            };
            if (sortType) {
                transferParams.$entity.sortPolicy = sortType;
            }
            if (delay) {
                transferParams.$entity.delay = delay;
            } else {
                //set delay on transfer according to unit type parameters
                if (sessvars.servicePointInfo) {
                    var sp = sessvars.servicePointInfo;
                    delaySecs = -1;
                    if (sp.parameters.walkQueueA == rowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeA;
                    } else if (sp.parameters.walkQueueB == rowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeB;
                    } else if (sp.parameters.walkQueueC == rowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeC;
                    } else if (sp.parameters.walkQueueD == rowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeD;
                    } else if (sp.parameters.walkQueueE == rowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeE;
                    } else if (sp.parameters.walkQueueF == rowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeF;
                    } else if (sp.parameters.walkQueueG == rowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeG;
                    } else if (sp.parameters.walkQueueH == rowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeH;
                    }
                    if (delaySecs != -1)
                        transferParams.$entity.delay = delaySecs;
                }
            }
            transferParams.json = JSON.stringify(transferParams.$entity);
            spService.putParams('branches/' + transferParams.branchId + '/queues/' + transferParams.queueId + '/visits/', transferParams);
            //Reset parameter 'marksInThisTransfer' in current visit
            var updateParams = servicePoint.createParams();
            updateParams.json = '{"marksInThisTransfer":""}';
            spService.putParams("branches/" + transferParams.branchId + "/visits/" + sessvars.state.visit.id + "/parameters", updateParams);
            if (delay) {
                util.showMessage(translate.msg('info.successful.transfer.with.delay', [sessvars.state.visit.ticketId, rowData.name, (delay / 60)]), false);
            } else {
                util.showMessage(translate.msg('info.successful.transfer', [sessvars.state.visit.ticketId, rowData.name]), false);
            }
            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false);
            if (sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                return;
            }
            sessvars.currentCustomer = null;
            sessvars.cfuSelectionSet = true;
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
        }
    };

    var transferCurrentVisitToQueueClicked = this._transferCurrentVisitToQueueClicked.bind(this);

    //transfer current visit to new service
    this._transferCurrentVisitToCounterPoolClicked = function (sortType, rowData, delay) {
        if (sessvars.state.userState == servicePoint.userState.SERVING) {

            var transferParams = servicePoint.createParams();
            transferParams.servicePointId = rowData.id;
            transferParams.$entity = {
                "fromId": sessvars.servicePointId,
                "fromBranchId": sessvars.branchId,
                "visitId": sessvars.state.visit.id
            };
            if (sortType) {
                transferParams.$entity.sortPolicy = sortType;
            }
            if (delay) {
                transferParams.$entity.delay = delay;
            }
            // transferParams.json='{"fromId":'+ sessvars.servicePointId + ',"fromBranchId":'+ sessvars.branchId + ',"visitId":' + visitId + ',"sortPolicy":"'+sortType + '"}';
            transferParams.json = JSON.stringify(transferParams.$entity);
            userPoolUpdateNeeded = false;
            //transferParams.json='{"fromId":'+ sessvars.servicePointId + ',"fromBranchId":'+ sessvars.branchId + ',"visitId":' + sessvars.state.visit.id + '}';
            spService.putParams('branches/' + transferParams.branchId + '/servicePoints/' + transferParams.servicePointId + '/visits/', transferParams);

            //Reset parameter 'marksInThisTransfer' in current visit
            var updateParams = servicePoint.createParams();
            updateParams.json = '{"marksInThisTransfer":""}';
            spService.putParams("branches/" + transferParams.branchId + "/visits/" + sessvars.state.visit.id + "/parameters", updateParams);

            if (delay) {
                util.showMessage(translate.msg('info.successful.transfer.with.delay', [sessvars.state.visit.ticketId, rowData.name, (delay / 60)]), false);
            } else {
                util.showMessage(translate.msg('info.successful.transfer', [sessvars.state.visit.ticketId, rowData.name]), false);
            }
            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false, null, null, servicePoint.update.NONE);
            if (sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                return;
            }
            sessvars.currentCustomer = null;
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
        }
    };

    var transferCurrentVisitToCounterPoolClicked = this._transferCurrentVisitToCounterPoolClicked.bind(this);

    this._transferCurrentVisitToUserPoolClicked = function (sortType, rowData, delay) {
        if (sessvars.state.userState == servicePoint.userState.SERVING) {

            var transferParams = servicePoint.createParams();
            transferParams.userId = rowData.id;
            transferParams.$entity = {
                "fromId": sessvars.servicePointId,
                "fromBranchId": sessvars.branchId,
                "visitId": sessvars.state.visit.id
            };
            if (sortType) {
                transferParams.$entity.sortPolicy = sortType;
            }
            if (delay) {
                transferParams.$entity.delay = delay;
            }
            transferParams.json = JSON.stringify(transferParams.$entity);
            spPoolUpdateNeeded = false;

            var requestStatus = spService.putParamsPromised('branches/' + transferParams.branchId + '/users/' + transferParams.userId + '/visits/', transferParams);
            //Reset parameter 'marksInThisTransfer' in current visit
            var updateParams = servicePoint.createParams();
            updateParams.json = '{"marksInThisTransfer":""}';
            spService.putParams("branches/" + transferParams.branchId + "/visits/" + sessvars.state.visit.id + "/parameters", updateParams);

            requestStatus.done(function () {
                if (delay) {
                    util.showMessage(translate.msg('info.successful.transfer.with.delay', [sessvars.state.visit.ticketId, rowData.fullName, (delay / 60)]), false);
                } else {
                    util.showMessage(translate.msg('info.successful.transfer', [sessvars.state.visit.ticketId, rowData.fullName]), false);
                }
            });

            sessvars.state = servicePoint.getState();
            sessvars.statusUpdated = new Date();
            servicePoint.updateWorkstationStatus(false, null, null, servicePoint.update.NONE);
            if (sessvars.state.userState == servicePoint.userState.NO_STARTED_USER_SESSION) {
                util.showError(jQuery.i18n.prop("error.not.loggedin"));
                return;
            }
            sessvars.currentCustomer = null;
        } else {
            util.showError(jQuery.i18n.prop("error.no.ongoing.transaction"));
        }
    };

    var transferCurrentVisitToUserPoolClicked = this._transferCurrentVisitToUserPoolClicked.bind(this);

    this.buildTransferToQueueTable = function (popoverComponent, selector, table, ticketId, visitId, isWorkProfileQueue) {
        var filterQueues = function (queuesData) {
            var i = queuesData.length;
            while (i--) {
                if (queuesData[i].queueType != "QUEUE") {
                    queuesData.splice(i, 1);
                }
            }
            return queuesData;
        };
        if (servicePoint.hasValidSettings()) {
            // ugly but working. used in the row callback to put the ticket number in the header.
            sessvars.ticketIdToTransfer = ticketId;
            //need to store some information from the tickets table for later usage, when calling/transferring a ticket
            if (table != null) {
                table.fnClearTable();
                var queues = spService.get("branches/" + sessvars.branchId + "/queues");
                if (queues.length > 0) {
                    var filteredQueues = filterQueues(queues);
                    table.fnAddData(filteredQueues);
                    table.fnAdjustColumnSizing();
                }
            } else {
                var columns = [
                    /* Queue name */        {
                        "sClass": "qm-table__first-column",
                        "sType": "qm-sort",
                        "mDataProp": "name"
                    },
                    /* Queue id */          {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"
                    },
                    /* Actions */      {
                        "sClass": "qm-table__last-column",
                        "sType": "qm-sort",
                        "mData": null,
                        "sDefaultContent": ""
                    }
                ];
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues";
                var headerCallback = function (nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferQueueName').each(function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.name'));
                    });
                    $(nHead).find('th').attr('scope', 'col');
                };
                var i = 0;
                var rowCallback = function (nRow, aData, iDisplayIndex) {
                    if ($('td:eq(0)', nRow).find('span').length == 0) {
                        var queueName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"queueNameSpan\">" + queueName + "</span>");
                        if (buttonTransferFirstEnabled == true) {
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketFirst' title='" + translate.msg("action.title.transfer.first", [sessvars.ticketIdToTransfer]) + "' id = 'queue-transfer-" + i + "-1'  >"
                                + "<i class='qm-action-btn__icon icon-queue-first' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.first", [sessvars.ticketIdToTransfer]) + "</span></button>");
                        }
                        if (buttonTransferLastEnabled == true) {
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketLast' id='icon-queue-last' title='" + translate.msg("action.title.transfer.last", [sessvars.ticketIdToTransfer]) + "'id = 'queue-transfer-" + i + "-2'>"
                                + "<i class='qm-action-btn__icon icon-queue-last' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.last", [sessvars.ticketIdToTransfer]) + "</span></button>");
                        }
                        if (buttonTransferSortEnabled == true) {
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketSort' id='icon-queue-sort' title='" + translate.msg("action.title.transfer.sorted.lifetime", [sessvars.ticketIdToTransfer]) + "'id = 'queue-transfer-" + i + "-3'>"
                                + "<i class='qm-action-btn__icon icon-clock' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.sorted.lifetime", [sessvars.ticketIdToTransfer]) + "</span></button>");
                        }
                        if (buttonTransferDelayedEnabled === true) {
                            $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketDelay' id='icon-queue-delay' title='" + translate.msg("action.title.transfer.with.delay", [sessvars.ticketIdToTransfer]) + "'id = 'queue-transfer-" + i + "-4'>"
                                + "<i class='qm-action-btn__icon icon-wrap-up' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.with.delay", [sessvars.ticketIdToTransfer]) + "</span></button>");
                        }
                        i += 1;
                    }
                    return nRow;
                };
                table = util.buildTableJson({
                    "tableSelector": selector, "url": url, "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search"),
                    "rowCallback": rowCallback, "columns": columns, "filter": true, "headerCallback": headerCallback, "emptySearchLabel": "info.transfer.queue.empty",
                    "scrollYHeight": "300px", "emptyTableLabel": "info.transfer.queue.empty", "filterData": filterQueues
                });

                $(selector).prepend("<caption class='sr-only'>Transfer to queue</caption>");

                table.fnSort([0, 'asc']);
            }
            //destroy old event handlers
            if (buttonTransferFirstEnabled == true) {
                $(selector).off('click', 'tbody td button.transferTicketFirst');
                $(selector).on('click', 'tbody td button.transferTicketFirst', function () {
                    var nTr = $(this).closest("tr").get(0);
                    var aData = table.fnGetData(nTr);
                    transferTicketToQueue("FIRST", aData, visitId, null, isWorkProfileQueue);
                    popoverComponent.disposeInstance();
                });
            }
            if (buttonTransferLastEnabled == true) {
                $(selector).off('click', 'tbody td button.transferTicketLast');
                $(selector).on('click', 'tbody td button.transferTicketLast', function () {
                    var nTr = $(this).closest("tr").get(0);
                    var aData = table.fnGetData(nTr);
                    transferTicketToQueue("LAST", aData, visitId, null, isWorkProfileQueue);
                    popoverComponent.disposeInstance();
                });
            }
            if (buttonTransferSortEnabled == true) {
                $(selector).off('click', 'tbody td button.transferTicketSort');
                $(selector).on('click', 'tbody td button.transferTicketSort', function () {
                    var nTr = $(this).closest("tr").get(0);
                    var aData = table.fnGetData(nTr);
                    transferTicketToQueue("SORTED", aData, visitId, null, isWorkProfileQueue);
                    popoverComponent.disposeInstance();
                });
            }
            if (buttonTransferDelayedEnabled === true) {
                $(selector).off('click', 'tbody td button.transferTicketDelay');
                $(selector).on('click', 'tbody td button.transferTicketDelay', function () {
                    var nTr = $(this).closest("tr").get(0);
                    var aData = table.fnGetData(nTr);
                    popoverComponent._showTransferWithDelay("queue", aData);
                });
            }

            return table;
        }
    };

    // Transfer to User pool
    this.buildTransferToUserPoolTable = function (popoverComponent, selector, table, ticketId, visitId, isWorkProfileQueue) {
        if (servicePoint.hasValidSettings()) {
            // ugly but working. used in the row callback to put the ticket number in the header.
            sessvars.ticketIdToTransfer = ticketId;

            if (table != null) {
                table.fnClearTable();
                var callParams = servicePoint.createParams();
                var users = spService.get("branches/" + callParams.branchId + "/users/validForUserPoolTransfer/");
                if (users.length > 0) {
                    table.fnAddData(users);
                    table.fnAdjustColumnSizing();
                }
            } else {
                var staffPoolColumns = [
                    /* Id */         {
                        "bSearchable": false,
                        "bVisible": false,
                        "sType": "qm-sort",
                        "mDataProp": "id"
                    },
                    /* User name  */ {
                        "sClass": "qm-table__first-column",
                        "sType": "qm-sort",
                        "mDataProp": "fullName"
                    },
                    /* Locale */     {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "locale"
                    },
                        /* Actions */      {
                        "sClass": "qm-table__last-column",
                        "bVisible": false,
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "mData": null,
                        "sDefaultContent": ""
                    },
                    /* Direction */  {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "direction"
                    },
                ];
                var staffPoolUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/users/validForUserPoolTransfer/";
                var staffPoolHeaderCallback = function (nHead, aasData, iStart, iEnd, aiDisplay) {

                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolName').each(function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.username'));
                    });
                    $(nHead).find('th').attr('scope', 'col');
                };
                var staffPoolRowCallback = function (nRow, aData, iDisplayIndex) {
                    if ($('td:eq(0)', nRow).find('a').length == 0) {
                        var staffName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<a href=\"#\" id=\" " + nRow + "\"  class=\"staffNameSpan\" title=\"" + translate.msg("action.title.transfer.staff.pool", [sessvars.ticketIdToTransfer, staffName]) + "\">" + staffName + "</a>");
                        // Transfer with delay: Uncomment this when pools support transfer with delay
                        // if (buttonTransferDelayedEnabled === true) {
                        //   $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketDelay' title='" + translate.msg("action.title.transfer.with.delay", [sessvars.ticketIdToTransfer]) + "'>"
                        //     + "<i class='qm-action-btn__icon icon-wrap-up' aria-hidden='true'></i>"
                        //     + "<span class='sr-only'>" + translate.msg("action.title.transfer.with.delay", [sessvars.ticketIdToTransfer]) + "</span></button>");
                        // }
                    }
                    return nRow;
                };
                table = util.buildTableJson({
                    "tableSelector": selector, "emptySearchLabel": "info.transfer.staff.pool.empty",
                    "url": staffPoolUrl, "rowCallback": staffPoolRowCallback, "columns": staffPoolColumns, "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search"),
                    "filter": true, "headerCallback": staffPoolHeaderCallback, "scrollYHeight": "300px",
                    "emptyTableLabel": "info.transfer.staff.pool.empty"
                });

                $(selector).prepend("<caption class='sr-only'>Transfer to staff member</caption>");

                table.fnSort([1, 'asc']);
            }
            //destroy old event handlers
            // Transfer with delay: Change selector to tbody tr td:first-child when transfer with delay is available
            $(selector).off('click', 'tbody tr td');
            //make new ones
            $(selector).on('click', 'tbody tr td', function () {
                var nTr = $(this).closest("tr").get(0);
                var aData = table.fnGetData(nTr);
                transferVisitInQueueToStaffPoolClicked("FIRST", aData, visitId, null, isWorkProfileQueue);
                popoverComponent.disposeInstance();
            });
            // Transfer with delay: Uncomment this when pools support transfer with delay
            // if (buttonTransferDelayedEnabled === true) {
            //   $(selector).off('click', 'tbody td button.transferTicketDelay');
            //   $(selector).on('click', 'tbody td button.transferTicketDelay', function(){
            //     var nTr = $(this).closest("tr").get(0);
            //     var aData = table.fnGetData(nTr);
            //     popoverComponent._showTransferWithDelay("staffPool", aData);
            //   });
            // }

            return table;
        }
    };


    // Transfer to Counter pool
    this.buildTransferToCounterPoolTable = function (popoverComponent, selector, table, ticketId, visitId, isWorkProfileQueue) {
        if (servicePoint.hasValidSettings()) {
            // ugly but working. used in the row callback to put the ticket number in the header.
            sessvars.ticketIdToTransfer = ticketId;
            if (table != null) {
                table.fnClearTable();
                var params = servicePoint.createParams();
                var servicePoints = spService.get("branches/" + params.branchId + "/servicePoints/validForServicePointPoolTransfer/");
                if (servicePoints.length > 0) {
                    table.fnAddData(servicePoints);
                    table.fnAdjustColumnSizing();
                }
            } else {
                var servicePointColumns = [
                    /* Name */        {
                        "sClass": "qm-table__first-column",
                        "sType": "qm-sort",
                        "mDataProp": "name"
                    },
                    /* Id */          {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"
                    },
                    /* Unit id */     {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "unitId"
                    },
                    /* State*/{
                        "bVisible": false,
                        "sType": "qm-sort",
                        "mDataProp": "state"
                    },
                    /* Actions */      {
                        "sClass": "qm-table__last-column",
                        "bSearchable": false,
                        "bVisible": false,
                        "sType": "qm-sort",
                        "mData": null,
                        "sDefaultContent": ""
                    },
                    /* Parameters */ {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "parameters"
                    }
                ];
                var servicePointUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/servicePoints/validForServicePointPoolTransfer/";
                var servicePointHeaderCallback = function (nHead, aasData, iStart, iEnd, aiDisplay) {

                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolName').each(function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.name'));
                    });
                    $(nHead).find('th').attr('scope', 'col');
                };
                var servicePointRowCallback = function (nRow, aData, iDisplayIndex) {
                    if ($('td:eq(0)', nRow).find('a').length == 0) {
                        var servicePointName = $('td:eq(0)', nRow).text();
                        if (aData.state === "CLOSED") {
                            $('td:eq(0)', nRow).empty().append("<a href=\"#\" class=\"servicePointNameSpan\" title=\"" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\">" + servicePointName +
                                "</a> <i class='qm-table__lock-icon icon-lock' aria-hidden='true'></i>");
                        } else {
                            $('td:eq(0)', nRow).empty().append("<a href=\"#\" class=\"servicePointNameSpan\" title=\"" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\">" + servicePointName +
                                "</a>");
                        }
                        // Transfer with delay: Uncomment this when pools support transfer with delay
                        // if (buttonTransferDelayedEnabled === true) {
                        //   $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketDelay' title='" + translate.msg("action.title.transfer.with.delay", [sessvars.ticketIdToTransfer]) + "'>"
                        //     + "<i class='qm-action-btn__icon icon-wrap-up' aria-hidden='true'></i>"
                        //     + "<span class='sr-only'>" + translate.msg("action.title.transfer.with.delay", [sessvars.ticketIdToTransfer]) + "</span></button>");
                        // }
                    }
                    return nRow;
                };
                table = util.buildTableJson({
                    "tableSelector": selector, "emptySearchLabel": "info.transfer.servicepoint.pool.empty",
                    "url": servicePointUrl, "rowCallback": servicePointRowCallback, "columns": servicePointColumns,
                    "filter": true, "headerCallback": servicePointHeaderCallback, "scrollYHeight": "300px", "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search"),
                    "emptyTableLabel": "info.transfer.servicepoint.pool.empty"
                });

                $(selector).prepend("<caption class='sr-only'>transfer to counter pool</caption>");

            }
            table.fnSort([[3, 'desc'], [0, 'asc']]); // open counters first
            //destroy old event handlers
            // Transfer with delay: Change selector to tbody tr td:first-child when transfer with delay is supported
            $(selector).off('click', 'tbody tr td');
            //make new ones
            $(selector).on('click', 'tbody tr td', function (e) {
                var nTr = $(this).closest("tr").get(0);
                var aData = table.fnGetData(nTr);
                transferVisitInQueueToServicePointPoolClicked("FIRST", aData, visitId, null, isWorkProfileQueue);
                popoverComponent.disposeInstance();
            });

            // Transfer with delay: Uncomment this when pools support transfer with delay
            // if (buttonTransferDelayedEnabled === true) {
            //   $(selector).off('click', 'tbody td button.transferTicketDelay');
            //   $(selector).on('click', 'tbody td button.transferTicketDelay', function(){
            //     var nTr = $(this).closest("tr").get(0);
            //     var aData = table.fnGetData(nTr);
            //     popoverComponent._showTransferWithDelay("counterPool", aData);
            //   });
            // }

            return table;
        }
    };

    //transfer icon pressed
    this._transferTicketToQueue = function (sortType, aRowData, visitId, delay, isWorkProfileQueue) {
        if (servicePoint.hasValidSettings()) {
            var transferParams = servicePoint.createParams();
            transferParams.queueId = aRowData.id;
            transferParams.$entity = {
                "fromId": sessvars.servicePointId,
                "fromBranchId": sessvars.branchId,
                "visitId": visitId
            };
            if (sortType) {
                transferParams.$entity.sortPolicy = sortType;
            }
            if (delay) {
                transferParams.$entity.delay = delay;
            } else {
                //set delay on transfer according to unit type parameters
                if (sessvars.servicePointInfo) {
                    var sp = sessvars.servicePointInfo;
                    delaySecs = -1;
                    if (sp.parameters.walkQueueA == aRowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeA;
                    } else if (sp.parameters.walkQueueB == aRowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeB;
                    } else if (sp.parameters.walkQueueC == aRowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeC;
                    } else if (sp.parameters.walkQueueD == aRowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeD;
                    } else if (sp.parameters.walkQueueE == aRowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeE;
                    } else if (sp.parameters.walkQueueF == aRowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeF;
                    } else if (sp.parameters.walkQueueG == aRowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeG;
                    } else if (sp.parameters.walkQueueH == aRowData.id) {
                        delaySecs = sp.parameters.walkQueueTimeH;
                    }
                    if (delaySecs != -1)
                        transferParams.$entity.delay = delaySecs;
                }
            }
            transferParams.json = JSON.stringify(transferParams.$entity);
            var requestStatus = spService.putParamsPromised('branches/' + transferParams.branchId + '/queues/' + transferParams.queueId + '/visits/', transferParams);
            //Reset parameter 'marksInThisTransfer' in current visit
            /* var updateParams = servicePoint.createParams();  
            updateParams.json = '{"marksInThisTransfer":""}';
            spService.putParams("branches/" + transferParams.branchId + "/visits/" + visitId + "/parameters", updateParams); */
            queues.updateQueues(true);
            queueViewController.navigateToOverview();

            requestStatus.done(function () {
                if (delay) {
                    util.showMessage(translate.msg('info.successful.transfer.with.delay', [sessvars.ticketIdToTransfer, aRowData.name, (delay / 60)]), false);
                } else {
                    util.showMessage(translate.msg('info.successful.transfer', [sessvars.ticketIdToTransfer, aRowData.name]), false);
                }
            });
            if (isWorkProfileQueue) {
                var $tableWrapper = $('#workProfileVisitsTable').closest('.dataTables_scrollBody');
                util.updateTableAndRestoreScrollPosition($tableWrapper, queues.loadWorkProfileVisits);
            }
        }
    };

    var transferTicketToQueue = this._transferTicketToQueue.bind(this);

    this._transferVisitInQueueToStaffPoolClicked = function (sortType, aRowData, visitId, delay, isWorkProfileQueue) {
        if (servicePoint.hasValidSettings()) {
            var transferParams = servicePoint.createParams();
            transferParams.userId = aRowData.id;
            transferParams.$entity = {
                "fromId": sessvars.servicePointId,
                "fromBranchId": sessvars.branchId,
                "visitId": visitId
            };
            if (sortType) {
                transferParams.$entity.sortPolicy = sortType;
            }
            if (delay) {
                transferParams.$entity.delay = delay;
            }

            transferParams.json = JSON.stringify(transferParams.$entity);
            spPoolUpdateNeeded = false;
            var requestStatus = spService.putParamsPromised('branches/' + transferParams.branchId + '/users/' + transferParams.userId + '/visits/', transferParams);
            //Reset parameter 'marksInThisTransfer' in current visit
            /* var updateParams = servicePoint.createParams();  
            updateParams.json = '{"marksInThisTransfer":""}';
            spService.putParams("branches/" + transferParams.branchId + "/visits/" + visitId + "/parameters", updateParams); */

            queues.updateQueues(true);
            queueViewController.navigateToOverview();

            requestStatus.done(function (err) {
                if (delay) {
                    util.showMessage(translate.msg('info.successful.transfer.with.delay', [sessvars.ticketIdToTransfer, aRowData.fullName, (delay / 60)]), false);
                } else {
                    util.showMessage(translate.msg('info.successful.transfer', [sessvars.ticketIdToTransfer, aRowData.fullName]), false);
                }
            });
            if (isWorkProfileQueue) {
                var $tableWrapper = $('#workProfileVisitsTable').closest('.dataTables_scrollBody');
                util.updateTableAndRestoreScrollPosition($tableWrapper, queues.loadWorkProfileVisits);
            }
        }
    };

    var transferVisitInQueueToStaffPoolClicked = this._transferVisitInQueueToStaffPoolClicked.bind(this);

    this._transferVisitInQueueToServicePointPoolClicked = function (sortType, aRowData, visitId, delay, isWorkProfileQueue) {
        if (servicePoint.hasValidSettings()) {
            var transferParams = servicePoint.createParams();
            transferParams.servicePointId = aRowData.id;
            transferParams.$entity = {
                "fromId": sessvars.servicePointId,
                "fromBranchId": sessvars.branchId,
                "visitId": visitId
            };
            if (sortType) {
                transferParams.$entity.sortPolicy = sortType;
            }
            if (delay) {
                transferParams.$entity.delay = delay;
            }
            transferParams.json = JSON.stringify(transferParams.$entity);
            userPoolUpdateNeeded = false;
            spService.putParams('branches/' + transferParams.branchId + '/servicePoints/' + transferParams.servicePointId + '/visits/', transferParams);
            //Reset parameter 'marksInThisTransfer' in current visit
            /* var updateParams = servicePoint.createParams();  
            updateParams.json = '{"marksInThisTransfer":""}';
            spService.putParams("branches/" + transferParams.branchId + "/visits/" + visitId + "/parameters", updateParams); */
            queues.updateQueues(true);
            queueViewController.navigateToOverview();
            if (delay) {
                util.showMessage(translate.msg('info.successful.transfer.with.delay', [sessvars.ticketIdToTransfer, aRowData.name, (delay / 60)]), false);
            } else {
                util.showMessage(translate.msg('info.successful.transfer', [sessvars.ticketIdToTransfer, aRowData.name]), false);
            }
            if (isWorkProfileQueue) {
                var $tableWrapper = $('#workProfileVisitsTable').closest('.dataTables_scrollBody');
                util.updateTableAndRestoreScrollPosition($tableWrapper, queues.loadWorkProfileVisits);
            }
        }
    };

    var transferVisitInQueueToServicePointPoolClicked = this._transferVisitInQueueToServicePointPoolClicked.bind(this);

    this.navigateToQueueView = function () {
        cardNavigationController.push(window.$Qmatic.components.card.transferQueueCard);
        this.renderCardTransferToQueue();
    };

    this.navigateToUserPoolView = function () {
        cardNavigationController.push(window.$Qmatic.components.card.transferUserPoolCard);
        this.renderCardTransferToUserPool();
    };

    this.navigateToCounterPoolView = function () {
        cardNavigationController.push(window.$Qmatic.components.card.transferCounterPoolCard);
        this.renderCardTransferToCounterPool();
    };

    // Transfer to queue from card
    this.renderCardTransferToQueue = function () {
        var filterQueues = function (queuesData) {
            var i = queuesData.length;
            while (i--) {
                if (queuesData[i].queueType != "QUEUE") {
                    queuesData.splice(i, 1);
                }
            }
            return queuesData;
        };
        if (servicePoint.hasValidSettings()) {
            //need to store some information from the tickets table for later usage, when calling/transferring a ticket
            if (transferTable != null) {
                transferTable.fnClearTable();
                var queues = spService.get("branches/" + sessvars.branchId + "/queues");
                if (queues.length > 0) {
                    var filteredQueues = filterQueues(queues);
                    transferTable.fnAddData(filteredQueues);
                    transferTable.fnAdjustColumnSizing();
                }
            } else {
                var columns = [
                    /* Queue name */        {
                        "sClass": "qm-table__first-column",
                        "sType": "qm-sort",
                        "mDataProp": "name"
                    },
                    /* Queue id */          {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"
                    },
                    /* Actions */      {
                        "sClass": "qm-table__last-column",
                        "sType": "qm-sort",
                        "mData": null,
                        "sDefaultContent": ""
                    }
                ];
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues";
                var headerCallback = function (nHead, aasData, iStart, iEnd, aiDisplay) {
                    $(nHead).closest('thead, THEAD').find('.transferQueueName').each(function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.name'));
                    });
                    $(nHead).closest('thead, THEAD').find('.transferQueueActions').each(function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.queue.actions'));
                    });
                    $(nHead).find('th').attr('scope', 'col');
                };
                var i = 0;

                var rowCallback = function (nRow, aData, iDisplayIndex) {

                    if ($('td:eq(0)', nRow).find('span').length == 0) {
                        var queueName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<span class=\"queueNameSpan\">" + queueName + "</span>");
                        if (buttonTransferFirstEnabled == true) {
                            $('td:eq(1)', nRow).append("<button tabindex='-1' class='qm-action-btn qm-action-btn--only-icon transferTicketFirst' title='" + translate.msg("action.title.transfer.first", [sessvars.state.visit.ticketId]) + " ' id='queue-transfer-" + i + "-1'>"
                                + "<i class='qm-action-btn__icon icon-queue-first' aria-hidden='true'></i>"
                                + "<span class='sr-only' >" + translate.msg("action.title.transfer.first", [sessvars.state.visit.ticketId]) + "</span></button>")
                            $('td:eq(1)', nRow).find('button').keydown(function (event) {
                                FocusMove(event.keyCode, this.id.substring(15, 16), 1, event);
                            });
                        }
                        if (buttonTransferLastEnabled == true) {
                            $('td:eq(1)', nRow).append("<button tabindex='-1' class='qm-action-btn qm-action-btn--only-icon transferTicketLast' title='" + translate.msg("action.title.transfer.last", [sessvars.state.visit.ticketId]) + "' id='queue-transfer-" + i + "-2'>"
                                + "<i class='qm-action-btn__icon icon-queue-last' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.last", [sessvars.state.visit.ticketId]) + "</span></button>")
                            $('td:eq(1)', nRow).find('button:nth-child(2)').keydown(function (event) {
                                FocusMove(event.keyCode, this.id.substring(15, 16), 2, event);
                            });
                        }
                        if (buttonTransferSortEnabled == true) {
                            $('td:eq(1)', nRow).append("<button tabindex='-1' class='qm-action-btn qm-action-btn--only-icon transferTicketSort' title='" + translate.msg("action.title.transfer.sorted.lifetime", [sessvars.state.visit.ticketId]) + "' id='queue-transfer-" + i + "-3'>"
                                + "<i class='qm-action-btn__icon icon-clock' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.sorted.lifetime", [sessvars.state.visit.ticketId]) + "</span></button>")
                            $('td:eq(1)', nRow).find('button:nth-child(3)').keydown(function (event) {
                                FocusMove(event.keyCode, this.id.substring(15, 16), 3, event);
                            });;
                        }
                        if (buttonTransferDelayedEnabled === true) {
                            $('td:eq(1)', nRow).append("<button tabindex='-1' class='qm-action-btn qm-action-btn--only-icon transferTicketDelay' title='" + translate.msg("action.title.transfer.with.delay", [sessvars.state.visit.ticketId]) + "'  id='queue-transfer-" + i + "-4'>"
                                + "<i class='qm-action-btn__icon icon-wrap-up' aria-hidden='true'></i>"
                                + "<span class='sr-only'>" + translate.msg("action.title.transfer.with.delay", [sessvars.state.visit.ticketId]) + "</span></button>")
                            $('td:eq(1)', nRow).find('button:nth-child(4)').keydown(function (event) {
                                FocusMove(event.keyCode, this.id.substring(15, 16), 4, event);
                            });;
                        }
                        i = i + 1;
                    }
                    return nRow;
                };

                // $('td:eq(1)').find('button::first-child').attr('tabindex','0');

                // arrow key navigation to queue transfer
                var FocusMove = function (keyCode, k, j, event) {
                    if (keyCode == 40) {
                        if (document.getElementById('queue-transfer-' + (parseInt(k) + 1) + '-' + j)) {
                            document.getElementById('queue-transfer-' + (parseInt(k) + 1) + '-' + j).focus();
                        }
                    } else if (keyCode == 38) {
                        if (document.getElementById('queue-transfer-' + (parseInt(k) - 1) + '-' + j)) {
                            document.getElementById('queue-transfer-' + (parseInt(k) - 1) + '-' + j).focus();
                        }
                    }
                    else if (keyCode == 39) {
                        for (m = (parseInt(j) + 1); m < 5; m++) {
                            if (document.getElementById('queue-transfer-' + k + '-' + m)) {
                                document.getElementById('queue-transfer-' + k + '-' + m).focus();
                                break;
                            }
                        }
                    }
                    else if (keyCode == 37) {
                        for (m = (parseInt(j) - 1); m > 0; m--) {
                            if (document.getElementById('queue-transfer-' + k + '-' + m)) {
                                document.getElementById('queue-transfer-' + k + '-' + m).focus();
                                break;
                            }
                        }
                    }
                }

                transferTable = util.buildTableJson({
                    "tableId": "transferToQueues", "url": url, "emptySearchLabel": "info.transfer.queue.empty",
                    "rowCallback": rowCallback, "columns": columns, "filter": true, "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "headerCallback": headerCallback,
                    "scrollYHeight": "auto", "emptyTableLabel": "info.transfer.queue.empty", "filterData": filterQueues, "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search")
                });
                $('#transferToQueues').prepend("<caption class='sr-only'>Transfer to queue</caption>");

            }
            transferTable.fnSort([0, 'asc']);

            var $jTable = $('#transferToQueues');
            //destroy old event handlers
            if (buttonTransferFirstEnabled == true) {
                $jTable.off('click', 'tbody td button.transferTicketFirst');
                $jTable.on('click', 'tbody td button.transferTicketFirst', function () {
                    var nTr = $(this).closest("tr").get(0);
                    var aData = transferTable.fnGetData(nTr);
                    transferCurrentVisitToQueueClicked("FIRST", aData);
                });
            }
            if (buttonTransferLastEnabled == true) {
                $jTable.off('click', 'tbody td button.transferTicketLast');
                $jTable.on('click', 'tbody td button.transferTicketLast', function () {
                    var nTr = $(this).closest("tr").get(0);
                    var aData = transferTable.fnGetData(nTr);
                    transferCurrentVisitToQueueClicked("LAST", aData);
                });
            }
            if (buttonTransferSortEnabled == true) {
                $jTable.off('click', 'tbody td button.transferTicketSort');
                $jTable.on('click', 'tbody td button.transferTicketSort', function () {
                    var nTr = $(this).closest("tr").get(0);
                    var aData = transferTable.fnGetData(nTr);
                    transferCurrentVisitToQueueClicked("SORTED", aData);
                });
            }
            if (buttonTransferDelayedEnabled === true) {
                $jTable.off('click', 'tbody td button.transferTicketDelay');
                $jTable.on('click', 'tbody td button.transferTicketDelay', function () {
                    var nTr = $(this).closest("tr").get(0);
                    var aData = transferTable.fnGetData(nTr);
                    cardNavigationController.push($Qmatic.components.card.transferDelayCard);
                    $Qmatic.components.card.transferDelayCard.attachListeners("queue", aData);
                });
            }
        }
    };

    // Transfer to queue from card
    this.renderCardTransferToUserPool = function () {
        if (servicePoint.hasValidSettings()) {

            if (transferToStaffPoolTable != null) {
                transferToStaffPoolTable.fnClearTable();
                var callParams = servicePoint.createParams();
                callParams.onlyServicePoints = 'true';
                var users = spService.get("branches/" + callParams.branchId + "/users/validForUserPoolTransfer/");
                if (users.length > 0) {
                    transferToStaffPoolTable.fnAddData(users);
                    transferToStaffPoolTable.fnAdjustColumnSizing();
                }
            } else {
                var staffPoolColumns = [
                    /* Id */         {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"
                    },
                    /* User name  */ {
                        "sClass": "qm-table__first-column",
                        "sType": "qm-sort",
                        "mDataProp": "fullName"
                    },
                    /* Locale */     {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "locale"
                    },
                    /* Actions */      {
                        "bVisible": false,
                        "sClass": "qm-table__last-column",
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "mData": null,
                        "sDefaultContent": ""
                    },
                    /* Direction */  {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "direction"
                    }
                ];
                var staffPoolUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/users/validForUserPoolTransfer/";
                var staffPoolHeaderCallback = function (nHead, aasData, iStart, iEnd, aiDisplay) {

                    $(nHead).closest('thead, THEAD').find('.transferStaffPoolName').each(function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.staff.pool.username'));
                    });
                    $(nHead).find('th').attr('scope', 'col');
                };
                var i = 0;
                var staffPoolRowCallback = function (nRow, aData, iDisplayIndex) {
                    if ($('td:eq(0)', nRow).find('a').length == 0) {
                        var staffName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<a href=\"#\"  id=\"staff-" + i + "\"  class=\"staffNameSpan\"  tabindex='-1' title=\"" +
                            translate.msg("action.title.transfer.staff.pool", [sessvars.state.visit.ticketId, staffName]) + "\">" + staffName + "</a>").keydown(function (event) {
                                if (event.keyCode == 40) {
                                    var currentId = parseInt(this.firstChild.id.substring(6, 7));
                                    if (document.getElementById('staff-' + (currentId + 1))) {
                                        document.getElementById('staff-' + (currentId + 1)).focus();
                                    }
                                } else if (event.keyCode == 38) {
                                    var currentId = parseInt(this.firstChild.id.substring(6, 7));
                                    if (document.getElementById('staff-' + (currentId - 1))) {
                                        document.getElementById('staff-' + (currentId - 1)).focus();
                                    }
                                }
                            });
                        i += 1;
                        // Transfer with delay: Uncomment this when pools support transfer with delay
                        // if (buttonTransferDelayedEnabled === true) {
                        //   $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketDelay' title='" + translate.msg("action.title.transfer.with.delay", [sessvars.state.visit.ticketId]) + "'>"
                        //     + "<i class='qm-action-btn__icon icon-wrap-up' aria-hidden='true'></i>"
                        //     + "<span class='sr-only'>" + translate.msg("action.title.transfer.with.delay", [sessvars.state.visit.ticketId]) + "</span></button>");
                        // }
                    }
                    return nRow;
                };
                transferToStaffPoolTable = util.buildTableJson({
                    "tableId": "transferTicketToUserPoolTable", "url": staffPoolUrl, "emptySearchLabel": "info.transfer.staff.pool.empty",
                    "rowCallback": staffPoolRowCallback, "columns": staffPoolColumns, "filter": true, "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "headerCallback": staffPoolHeaderCallback,
                    "scrollYHeight": "auto", "emptyTableLabel": "info.transfer.staff.pool.empty", "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search")
                });
                $('#transferTicketToUserPoolTable').prepend("<caption class='sr-only'>Transfer to staff member</caption>");
            }
            transferToStaffPoolTable.fnSort([1, 'asc']);
            //destroy old event handlers
            var $jTable = $("#transferTicketToUserPoolTable");
            // Transfer with delay: Change selector to tbody tr td:first-child when delay is available
            $jTable.off('click', 'tbody tr td');
            //make new ones
            $jTable.on('click', 'tbody tr td', function () {
                var nTr = $(this).closest("tr").get(0);
                var aData = transferToStaffPoolTable.fnGetData(nTr);
                transferCurrentVisitToUserPoolClicked("FIRST", aData);
            });

            // Transfer with delay: Uncomment this when pools support transfer with delay
            // if (buttonTransferDelayedEnabled === true) {
            //   $jTable.off('click', 'tbody td button.transferTicketDelay');
            //   $jTable.on('click', 'tbody td button.transferTicketDelay', function(){
            //     var nTr = $(this).closest("tr").get(0);
            //     var aData = transferToStaffPoolTable.fnGetData(nTr);
            //     cardNavigationController.push($Qmatic.components.card.transferDelayCard);
            //     $Qmatic.components.card.transferDelayCard.attachListeners("staffPool", aData);
            //   });
            // }
        }
    };

    // COUNTER POOL
    this.renderCardTransferToCounterPool = function () {
        if (servicePoint.hasValidSettings()) {

            if (transferToServicePointPoolTable != null) {
                transferToServicePointPoolTable.fnClearTable();
                var params = servicePoint.createParams();
                var servicePoints = spService.get("branches/" + params.branchId + "/servicePoints/validForServicePointPoolTransfer/");
                if (servicePoints.length > 0) {
                    transferToServicePointPoolTable.fnAddData(servicePoints);
                    transferToServicePointPoolTable.fnAdjustColumnSizing();
                }
            } else {
                var servicePointColumns = [
                    /* Name */        {
                        "sClass": "qm-table__first-column",
                        "sType": "qm-sort",
                        "mDataProp": "name"
                    },
                    /* Id */          {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "id"
                    },
                    /* Unit id */     {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "unitId"
                    },
                        /* Actions */      {
                        "sClass": "qm-table__last-column",
                        "bVisible": false,
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "mData": null,
                        "sDefaultContent": ""
                    },
                    /* State*/{
                        "bVisible": false,
                        "sType": "qm-sort",
                        "mDataProp": "state"
                    },
                    /* Parameters */ {
                        "bSearchable": false,
                        "sType": "qm-sort",
                        "bVisible": false,
                        "mDataProp": "parameters"
                    }
                ];
                var i = 0;
                var servicePointUrl = "/rest/servicepoint/branches/" + sessvars.branchId + "/servicePoints/validForServicePointPoolTransfer/";
                var servicePointHeaderCallback = function (nHead, aasData, iStart, iEnd, aiDisplay) {
                    i = 0;
                    $(nHead).closest('thead, THEAD').find('.transferServicePointPoolName').each(function (i, item) {
                        $(item).html(jQuery.i18n.prop('info.transfer.servicepoint.pool.name'));
                    });
                    $(nHead).find('th').attr('scope', 'col');
                };

                var servicePointRowCallback = function (nRow, aData, iDisplayIndex) {

                    if ($('td:eq(0)', nRow).find('a').length == 0) {
                        var servicePointName = $('td:eq(0)', nRow).text();
                        if (aData.state === "CLOSED") {
                            $('td:eq(0)', nRow).empty().append("<a href=\"#\" tabindex='-1' class=\"servicePointNameSpan\" id = \"servicePoint-" + i + "\" title=\"" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\">" + servicePointName +
                                "</a> <i class='qm-table__lock-icon icon-lock' aria-hidden='true'></i>").keydown(function (event) {
                                    if (event.keyCode == 40) {
                                        var currentId = parseInt(this.firstChild.id.substring(13, 14));
                                        if (document.getElementById('servicePoint-' + (currentId + 1))) {
                                            document.getElementById('servicePoint-' + (currentId + 1)).focus();
                                        }
                                    } else if (event.keyCode == 38) {
                                        var currentId = parseInt(this.firstChild.id.substring(13, 14));
                                        if (document.getElementById('servicePoint-' + (currentId - 1))) {
                                            document.getElementById('servicePoint-' + (currentId - 1)).focus();
                                        }
                                    }
                                });
                            i += 1;
                        } else {
                            $('td:eq(0)', nRow).empty().append("<a href=\"#\" tabindex='-1' class=\"servicePointNameSpan\" id = \"servicePoint-" + i + "\" title=\"" + translate.msg("action.title.transfer.servicepoint.pool", [sessvars.ticketIdToTransfer, servicePointName]) + "\">" + servicePointName +
                                "</a>").keydown(function (event) {
                                    if (event.keyCode == 40) {
                                        var currentId = parseInt(this.firstChild.id.substring(13, 14));
                                        if (document.getElementById('servicePoint-' + (currentId + 1))) {
                                            document.getElementById('servicePoint-' + (currentId + 1)).focus();
                                        }
                                    } else if (event.keyCode == 38) {
                                        var currentId = parseInt(this.firstChild.id.substring(13, 14));
                                        if (document.getElementById('servicePoint-' + (currentId - 1))) {
                                            document.getElementById('servicePoint-' + (currentId - 1)).focus();
                                        }
                                    }
                                });;
                            i += 1;
                        }

                        // Transfer with delay: Uncomment this when pools support transfer with delay
                        // if (buttonTransferDelayedEnabled === true) {
                        //   $('td:eq(1)', nRow).append("<button class='qm-action-btn qm-action-btn--only-icon transferTicketDelay' title='" + translate.msg("action.title.transfer.with.delay", [sessvars.ticketIdToTransfer]) + "'>"
                        //     + "<i class='qm-action-btn__icon icon-wrap-up' aria-hidden='true'></i>"
                        //     + "<span class='sr-only'>" + translate.msg("action.title.transfer.with.delay", [sessvars.ticketIdToTransfer]) + "</span></button>");
                        // }
                    }
                    return nRow;
                };
                transferToServicePointPoolTable = util.buildTableJson({
                    "tableId": "transferTicketToCounterPoolTable", "emptySearchLabel": "info.transfer.servicepoint.pool.empty",
                    "url": servicePointUrl, "rowCallback": servicePointRowCallback, "columns": servicePointColumns, "filter": true, "customFilter": true, "infoFiltered": "info.filtered.fromEntries", "headerCallback": servicePointHeaderCallback,
                    "scrollYHeight": "auto", "emptyTableLabel": "info.transfer.servicepoint.pool.empty", "placeholder": jQuery.i18n.prop("info.placeholder.transfer.search")
                });
                $('#transferTicketToCounterPoolTable').prepend("<caption class='sr-only'>transfer to counter pool</caption>");
            }
            transferToServicePointPoolTable.fnSort([[3, 'desc'], [0, 'asc']]);// open counters first

            var $jTable = $("#transferTicketToCounterPoolTable");
            //destroy old event handlers
            // Transfer with delay: Change selector to tbody tr td:first-child when delay is available
            $jTable.off('click', 'tbody tr td');
            //make new ones
            $jTable.on('click', 'tbody tr td', function () {
                var nTr = $(this).closest("tr").get(0);
                var aData = transferToServicePointPoolTable.fnGetData(nTr);
                transferCurrentVisitToCounterPoolClicked("FIRST", aData);
            });

            // Transfer with delay: Uncomment this when pools support transfer with delay
            // if (buttonTransferDelayedEnabled === true) {
            //   $jTable.off('click', 'tbody td button.transferTicketDelay');
            //   $jTable.on('click', 'tbody td button.transferTicketDelay', function(){
            //     var nTr = $(this).closest("tr").get(0);
            //     var aData = transferToServicePointPoolTable.fnGetData(nTr);
            //     cardNavigationController.push($Qmatic.components.card.transferDelayCard);
            //     $Qmatic.components.card.transferDelayCard.attachListeners("counterPool", aData);
            //   });
            // }
        }
    };
    // Transfer to the queue list focus the first button when press tab from the search input box
    $("#transferToQueueTableBody").focus(function () {
        setTimeout(function () {
            $('#transferToQueues').find('button')[0].focus();
        }, 10);
    }
    );
    //   ransfer to the counter pool list focus the first button when press tab from the search input box
    $("#transferTicketToCounterPoolTableBody").focus(function () {
        setTimeout(function () {
            $('#transferTicketToCounterPoolTableBody').find('a')[0].focus();
        }, 10);
    }
    );
    $("#transferTicketToUserPoolTableBody").focus(function () {
        setTimeout(function () {
            $('#transferTicketToUserPoolTableBody').find('a')[0].focus();
        }, 10);
    }
    );
    //   transfer back to the inputbox from the buttons
    var map = { 16: false, 09: false };
    $("#transferToQueueTableBody").keydown(function (e) {
        if (e.keyCode in map) {
            map[e.keyCode] = true;
        }
    }).keyup(function (e) {
        if (e.keyCode in map) {
            if (map[16] && map[9]) {
                $('#search-queues-input').focus();
            }
            map[e.keyCode] = false;
        }

    });

    $("#transferTicketToCounterPoolTableBody").keydown(function (e) {
        if (e.keyCode in map) {
            map[e.keyCode] = true;
        }
    }).keyup(function (e) {
        if (e.keyCode in map) {
            if (map[16] && map[9]) {
                $('#transferTicketToCounterPoolTableInput').focus();
            }
            map[e.keyCode] = false;
        }

    });

    $("#transferTicketToUserPoolTableBody").keydown(function (e) {
        if (e.keyCode in map) {
            map[e.keyCode] = true;
        }
    }).keyup(function (e) {
        if (e.keyCode in map) {
            if (map[16] && map[9]) {
                $('#transferTicketToUserPoolTableInput').focus();
            }
            map[e.keyCode] = false;
        }

    });

};