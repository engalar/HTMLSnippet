define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/dom-construct",
    "dojo/_base/lang",
], function (
    declare,
    _WidgetBase,
    domConstruct,
    lang,
) {
    "use strict";

    return declare("TinySnippet.widget.TinySnippet", [_WidgetBase], {
        // Set in Modeler
        contents: "",
        refreshOnContextChange: false,
        refreshOnContextUpdate: false,

        // Internal
        _objectChangeHandler: null,
        contextObj: null,

        postCreate: function () {
            if (!this.refreshOnContextChange) {
                this.evalJs();
            }
        },

        update: function (obj, callback) {
            this.contextObj = obj;
            if (this.refreshOnContextChange) {
                this.evalJs();

                if (this.refreshOnContextUpdate) {
                    if (this._objectChangeHandler !== null) {
                        this.unsubscribe(this._objectChangeHandler);
                    }
                    if (obj) {
                        this._objectChangeHandler = this.subscribe({
                            guid: obj.getGuid(),
                            callback: lang.hitch(this, function () {
                                this.evalJs();
                            })
                        });
                    }
                }
            }

            this._executeCallback(callback, "update");
        },

        evalJs: function () {
            try {
                eval(this.contents + "\r\n//# sourceURL=" + this.id + ".js");
            } catch (error) {
                this._handleError(error);
            }
        },

        _handleError: function (error) {
            domConstruct.place(
                '<div class="alert alert-danger">Error while evaluating javascript input: ' +
                error +
                "</div>",
                this.domNode,
                "only"
            );
        },

        _executeCallback: function (cb, from) {
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});
