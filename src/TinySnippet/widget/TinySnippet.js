define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dojo/dom-style",
    "dojo/dom-attr",
    "dojo/dom-construct",
    "dojo/_base/lang",
    "dojo/html",
    "dijit/layout/LinkPane"
], function (
    declare,
    _WidgetBase,
    domStyle,
    domAttr,
    domConstruct,
    lang,
    html,
    LinkPane
) {
    "use strict";

    return declare("TinySnippet.widget.TinySnippet", [_WidgetBase], {
        // Set in Modeler
        contents: "",
        documentation: "",
        refreshOnContextChange: false,
        refreshOnContextUpdate: false,
        encloseHTMLWithDiv: true,

        // Internal
        _objectChangeHandler: null,
        contextObj: null,

        postCreate: function () {
            if (!this.refreshOnContextChange) {
                this.evalJs();
            }
        },

        update: function (obj, callback) {
            console.debug(this.id + ".update");
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
            console.debug(this.id + ".evalJS");
            try {
                eval(this.contents + "\r\n//# sourceURL=" + this.id + ".js");
            } catch (error) {
                this._handleError(error);
            }
        },

        _handleError: function (error) {
            console.debug(this.id + "._handleError");
            domConstruct.place(
                '<div class="alert alert-danger">Error while evaluating javascript input: ' +
                error +
                "</div>",
                this.domNode,
                "only"
            );
        },

        _executeCallback: function (cb, from) {
            console.debug(this.id + "._executeCallback" + (from ? " from " + from : ""));
            if (cb && typeof cb === "function") {
                cb();
            }
        }
    });
});
