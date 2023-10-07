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
        contentsPath: "",
        onclickmf: "",
        documentation: "",
        refreshOnContextChange: false,
        refreshOnContextUpdate: false,
        encloseHTMLWithDiv: true,

        // Internal
        _objectChangeHandler: null,
        contextObj: null,

        postCreate: function () {
            console.debug(this.id + ".postCreate");
            this._setupEvents();

            if (!this.refreshOnContextChange) {
                this.executeCode();
            }
        },

        executeCode: function () {
            console.debug(this.id + ".executeCode");
            var external = this.contentsPath !== "" ? true : false;

            if (external) {
                var scriptNode = document.createElement("script"),
                    intDate = +new Date();

                scriptNode.type = "text/javascript";
                scriptNode.src =
                    this.contentsPath + "?v=" + intDate.toString();

                domConstruct.place(scriptNode, this.domNode, "only");
            } else {
                this.evalJs();
            }
        },

        update: function (obj, callback) {
            console.debug(this.id + ".update");
            this.contextObj = obj;
            if (this.refreshOnContextChange) {
                this.executeCode();

                if (this.refreshOnContextUpdate) {
                    if (this._objectChangeHandler !== null) {
                        this.unsubscribe(this._objectChangeHandler);
                    }
                    if (obj) {
                        this._objectChangeHandler = this.subscribe({
                            guid: obj.getGuid(),
                            callback: lang.hitch(this, function () {
                                this.executeCode();
                            })
                        });
                    }
                }
            }

            this._executeCallback(callback, "update");
        },

        _setupEvents: function () {
            console.debug(this.id + "._setupEvents");
            if (this.onclickmf) {
                this.connect(
                    this.domNode,
                    "click",
                    this._executeMicroflow
                );
            }
        },

        _executeMicroflow: function () {
            console.debug(this.id + "._executeMicroflow");
            if (this.onclickmf) {
                var params = {
                    actionname: this.onclickmf
                };
                if (this.contextObj !== null) {
                    params.applyto = "selection";
                    params.guids = [this.contextObj.getGuid()];
                }
                mx.data.action({
                    params: params,
                    callback: function (obj) {
                        console.debug(
                            this.id + " (executed microflow successfully)."
                        );
                    },
                    error: function (error) {
                        console.error(this.id + error);
                    }
                });
            }
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
