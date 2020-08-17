
window.$Qmatic.components.modal.autoCloseExtendModalComponent = function (selector) {

    var counterInterval;
    var initialTimeout;
    var counterValue = "20 seconds";

    // @Override
    this.onInit = function (selector) {
        if (selector) {
            window.$Qmatic.components.modal.autoCloseExtendModalComponent.prototype.onInit.call(this, selector);
            this.hide()
        }
    }

    this.show = function () {
        $("#autoCloseTimerBoxContent").hide();
        $("#autoCloseTimerSrOnly").text(translate.msg("info.auto.close.extend.timerText") + ' ' + "20 seconds");
        counterValue = "20 seconds";
        window.$Qmatic.components.modal.autoCloseExtendModalComponent.prototype.show.call(this);
        initialTimeout = setTimeout(function () {
            var counter = 20;
            var documentFocused = true;
            counterInterval = setInterval(function () {
                counter--;

                $("#autoCloseTimerTime").text(util.formatIntoHHMMSS(counter).substr(6));
                counterValue = util.formatIntoHHMMSS(counter);
                if (!document.hasFocus()) {
                    documentFocused = false;
                }
                if (documentFocused == false) {
                    if (document.hasFocus()) {
                        documentFocused = true;
                        $("#autoCloseTimerSrOnly").text(translate.msg("info.auto.close.extend.timerText") + ' ' + counterValue);
                    }
                }
                if (counter % 5 == 0) {
                    if (counter > 0) {
                        $("#autoCloseTimerSrOnly").text(translate.msg("info.auto.close.extend.timerText") + ' ' + counterValue);
                    }
                    else {
                        $("#autoCloseTimerSrOnly").text(translate.msg("info.auto.close.extend.session.expired"));
                    }

                }
            }, 1000);
            $("#autoCloseTimerBoxContent").show();
        }, 10000);

    }

    this.hide = function () {
        window.$Qmatic.components.modal.autoCloseExtendModalComponent.prototype.hide.call(this);
        if (counterInterval) {
            $("#autoCloseTimerTime").text("20");
            $("#autoCloseTimerSrOnly").text(translate.msg("info.auto.close.extend.timerText") + ' ' + "20 seconds");
            clearInterval(counterInterval);
        }
        if (initialTimeout) {
            clearTimeout(initialTimeout);
        }
    }

    this.onInit.apply(this, arguments);
}
$("#autoCloseTimerWhiteBox").click(function () {
    $("#autoCloseTimerSrOnly").text(translate.msg("info.auto.close.extend.timerText") + ' ' + counterValue);
});
//  Base Modal Class Inherits from BaseComponent
window.$Qmatic.components.modal.autoCloseExtendModalComponent.prototype = new window.$Qmatic.components.modal.BaseModalComponent()
window.$Qmatic.components.modal.autoCloseExtendModalComponent.prototype.constructor = window.$Qmatic.components.modal.autoCloseExtendModalComponent
