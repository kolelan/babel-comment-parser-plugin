(self["webpackChunkcagornir_ui"] = self["webpackChunkcagornir_ui"] || []).push([[328],{
    /***/ 21245:
    /***/ (() => {
        /**
         * Контроллер компонента модального окна.
         * @class {Component.ui.window.modal.view.MainController}
         */

        Ext.define('Component.ui.window.modal.view.MainController', {
            alias: 'controller.component-ui-window-modal-main',
            extend: 'Ext.app.ViewController',

            control: {
                'component-ui-window-modal-main': {

                    /**
                     * Обработчик события, срабатывающий перед отображением модального окна.
                     * Тюнинг размера окна под родительское окно.
                     * @param {Ext.window.Window} win
                     */

                    beforeshow: function(win) {
                        var view = this.getView(),
                            parent = view.getParent(),
                            psize = parent.getSize();

                        psize.height *= view.getScaleHeight();
                        psize.width *= view.getScaleWidth();
                        win.setSize(psize);
                        win.center();
                    },

                    /**
                     * Обработчик события максимизации модального окна.
                     * Развёртывание модального окна во всё браузерное окно.
                     * @param {Ext.window.Window} win
                     */
                    maximize: function(win) {
                        var psize = {
                            height: document.body.clientHeight,
                            width: document.body.clientWidth
                        };

                        win.setSize(psize);
                        win.setLocalXY(0,0); // Размещение модального окна в углу браузерного, а не по центру родительского.
                    }
                }
            },

            /**
             * Формирует и отображает предупреждение о недостатке данных для сохранения
             * и предлагает пользователю закрыть редактор или продолжить редактированию.
             * @param {Ext.window.Window} win
             * @param {Ext.data.Model | Ext.data.Store} record | store
             * @param {Object} options
             */

            raiseHasNotEnoughDataMessage: function(win, record, options) {
                var self = this,
                    closeWindow = options.closeWindow || true,
                    message = 'Для сохранения записи недостаточно данных. Да - продолжить заполнение. Нет - закрыть редактор.',
                    store = record.isStore ? record : record.store;

                Ext.MessageBox.show({
                    title: 'Внимание',
                    message: message,
                    buttons: Ext.MessageBox.YESNO,
                    icon: Ext.MessageBox.QUESTION,
                    fn: function (btn) {
                        switch (btn) {
                            case 'no':
                                if (!store) {
                                    self.closeWindow(win);
                                    return;
                                }

                                self.rejectChanges(store);
                                self.closeWindow(win);
                                break;
                        }
                    }
                });
            },

            /**
             * Формирует и отображает предупреждение о наличии несохраненных данных
             * и предлагает пользователю сохранить или отклонить их.
             * @param {Ext.window.Window} win
             * @param {Ext.data.Model} record
             * @param {Object} options
             */

            raiseHasUnsavedDataMessage: function(win, record, options) {
                var self = this,
                    options = options || {},
                    callback = options.callback || Ext.emptyFn,
                    closeWindow = options.closeWindow || true,
                    message = options.message || 'Есть несохраненные данные. Сохранить изменения?';

                Ext.MessageBox.show({
                    title: 'Внимание',
                    message: message,
                    buttons: Ext.MessageBox.YESNOCANCEL,
                    icon: Ext.MessageBox.WARNING,
                    fn: function (btn) {
                        switch (btn) {
                            case 'no':
                                if (!record.store) {
                                    self.closeWindow(win);
                                    return;
                                }

                                self.rejectChanges(record.store);
                                self.closeWindow(win);
                                break;

                            case 'yes':
                                if (record.isValid() === false || !Ext.isEmpty(record.removedFrom)) {
                                    self.raiseHasNotEnoughDataMessage(win, record, options);
                                    return;
                                }

                                if (!record.store) {
                                    self.closeWindow(win);
                                    return;
                                }

                                win.mask('Сохранение данных...');
                                self.saveChanges(record.store, {
                                    failure: function() {
                                        win.unmask();
                                    },

                                    success: function() {
                                        win.unmask();
                                        Ext.callback(callback);
                                        self.closeWindow(win);
                                    }
                                });

                                break;
                        }
                    }
                });
            },

            /**
             * Формирует и отображает предупреждение о наличии несохраненных данных
             * древовидного грида и предлагает пользователю сохранить или отклонить их.
             * @param {Ext.window.Window} win
             * @param {Ext.data.Model} record
             * @param {Ext.data.Store} store
             * @param {Object} options
             */

            raiseHasUnsavedTreeDataMessage: function(win, record, store, options) {
                var self = this,
                    options = options || {},
                    callback = options.callback || Ext.emptyFn,
                    closeWindow = options.closeWindow || true,
                    message = options.message || 'Есть несохраненные данные. Сохранить изменения?';

                Ext.MessageBox.show({
                    title: 'Внимание',
                    message: message,
                    buttons: Ext.MessageBox.YESNOCANCEL,
                    icon: Ext.MessageBox.WARNING,
                    fn: function (btn) {
                        switch (btn) {
                            case 'no':
                                var parent = record.parentNode;
                                if (record.phantom) {
                                    record.remove();
                                    if(!parent.hasChildNodes()) {
                                        parent.set('leaf', true);
                                        parent.commit();
                                    }
                                }

                                self.rejectChanges(store);
                                self.closeWindow(win);
                                break;

                            case 'yes':
                                if (record.isValid() === false || !Ext.isEmpty(record.removedFrom)) {
                                    self.raiseHasNotEnoughDataMessage(win, store, options);
                                    return;
                                }

                                win.mask('Сохранение данных...');
                                self.saveChanges(store, {
                                    failure: function() {
                                        win.unmask();
                                    },

                                    success: function() {
                                        win.unmask();
                                        Ext.callback(callback);
                                        self.closeWindow(win);
                                    }
                                });

                                break;
                        }
                    }
                });
            },

            /**
             * @private
             */

            rejectChanges: function(store) {
                store.isModel ? store.reject() :
                    store.rejectChanges();
            },

            /**
             * @private
             */

            saveChanges: function(store, options) {
                store.isModel ? store.save(options) :
                    store.sync(options);
            },

            /**
             * @private
             */

            closeWindow: function(win) {
                win.suspendEvents();
                win.close();
            }
        });
    }),
    /***/ 17796:
    /***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

        /**
         * Контроллер табличной кнопки добавления записи
         * @class {Extension.ui.gridbuttons.AddButtonController}
         */

        __webpack_require__(52564);
        Ext.define('Extension.ui.gridbuttons.AddButtonController', {
            alias: 'controller.extension-ui-grid-buttons-add',
            extend: 'Extension.ui.gridbuttons.AbstractButtonController',

            /**
             * Обработчик события нажатия кнопки. Добавляет новую запись.
             */

            onClickAddButton: function () {
                var grid = this.getView().getOwner(),
                    sm = grid.getSelectionModel(),
                    view = grid.getView(),
                    store = grid.getStore();
                store.insert(0, {});
                sm.select(0);
                view.focusRow(0);
            }
        });

        /***/ }),
}]);
