        document.addEventListener('DOMContentLoaded', () => {
            const app = {
                db: {
                    lists: [
                        { id: 'my-day', title: '我的一天', icon: 'sun', type: 'system' },
                        { id: 'important', title: '重要', icon: 'star', type: 'system' },
                        { id: 'weekly-overview', title: '本周速览', icon: 'week', type: 'system' },
                        { id: 'tasks', title: '全部任务', icon: 'home', type: 'system' },
                        { id: 'memos', title: '备忘录', icon: 'memo', type: 'system' }
                    ],
                    tasks: [],
                    memos: []
                },
                state: {
                    currentListId: 'tasks',
                    storageKey: 'ms_todo_pro_vfinal',
                    idbName: 'todo_app_db',
                    idbStore: 'app_kv',
                    idbDataKey: 'appData',
                    draggedListId: null,
                    editingTaskId: null,
                    editingListId: null,
                    editingSteps: [],
                    editingStepEditId: null,
                    addingSteps: [],
                    addingStepEditId: null,
                    newlyAddedTaskIds: [],
                    clickedTaskId: null,
                    listSwitchedPulse: false,
                    expandedTaskIds: [],
                    showCompleted: true,
                    showDetails: false,
                    sidebarSearchKeyword: '',
                    sortMode: 'default',
                    skipNextAutoCollapse: false,
                    currentMemoId: null,
                    isMemoModalExpanded: false,
                    timePickerTarget: null,
                    timePickerHour: null
                },
                
                dom: {
                    navList: document.getElementById('nav-list'),
                    newListInput: document.getElementById('new-list-input'),
                    sidebarSearchWrap: document.getElementById('sidebar-search-wrap'),
                    sidebarSearchInput: document.getElementById('sidebar-search-input'),
                    sidebarSearchClear: document.getElementById('sidebar-search-clear'),
                    viewTitle: document.getElementById('view-title'),
                    dateDisplay: document.getElementById('current-date'),
                    progressStats: document.getElementById('progress-stats'),
                    taskList: document.getElementById('task-list'),
                    memoPage: document.getElementById('memo-page'),
                    memoList: document.getElementById('memo-list'),
                    taskInputWrapper: document.getElementById('task-input-wrapper'),
                    
                    inpText: document.getElementById('task-text'),
                    inpNote: document.getElementById('task-note'),
                    inpDate: document.getElementById('task-date'),
                    inpTime: document.getElementById('task-time'),
                    btnClearTaskTimeX: document.getElementById('btn-clear-task-time-x'),
                    dueQuickInline: document.getElementById('due-quick-inline'),
                    editDueQuickInline: document.getElementById('edit-due-quick-inline'),
                    inpStepInput: document.getElementById('task-step-input'),
                    inpStepList: document.getElementById('add-step-list'),
                    inpStepAddRow: document.getElementById('add-step-row'),
                    inpRecurrence: document.getElementById('task-recurrence'),
                    inpList: document.getElementById('task-list-select'),
                    btnAdd: document.getElementById('btn-add-task'),
                    btnCollapseInput: document.getElementById('btn-collapse-input'),
                    btnNewMemo: document.getElementById('btn-new-memo'),
                    btnExpandMemo: document.getElementById('btn-expand-memo'),
                    btnDeleteMemo: document.getElementById('btn-delete-memo'),
                    btnCloseMemo: document.getElementById('btn-close-memo'),
                    btnToggleCompleted: document.getElementById('btn-toggle-completed'),
                    txtToggleCompleted: document.getElementById('toggle-completed-text'),
                    btnToggleNotes: document.getElementById('btn-toggle-notes'),
                    txtToggleNotes: document.getElementById('toggle-notes-text'),
                    sortMode: document.getElementById('sort-mode'),
                    btnClearSort: document.getElementById('btn-clear-sort'),
                    
                    modalOverlay: document.getElementById('modal-overlay'),
                    modalTask: document.getElementById('modal-task-edit'),
                    modalList: document.getElementById('modal-list-edit'),
                    modalMemo: document.getElementById('modal-memo-edit'),
                    btnsCancel: document.querySelectorAll('.btn-cancel'),

                    editInpText: document.getElementById('edit-task-text'),
                    editInpNote: document.getElementById('edit-task-note'),
                    editInpDate: document.getElementById('edit-task-date'),
                    editInpTime: document.getElementById('edit-task-time'),
                    btnClearEditTimeX: document.getElementById('btn-clear-edit-time-x'),
                    editInpRecurrence: document.getElementById('edit-task-recurrence'),
                    editInpList: document.getElementById('edit-task-list'),
                    editStepList: document.getElementById('edit-step-list'),
                    editStepInput: document.getElementById('edit-step-input'),
                    editStepAddRow: document.querySelector('#edit-steps-box .step-add-row'),
                    btnSaveTask: document.getElementById('btn-save-task-edit'),

                    editInpListName: document.getElementById('edit-list-name'),
                    btnSaveList: document.getElementById('btn-save-list-edit'),
                    memoUpdatedAt: document.getElementById('memo-updated-at'),
                    memoTitleInput: document.getElementById('memo-title-input'),
                    memoContentInput: document.getElementById('memo-content-input'),

                    btnExport: document.getElementById('btn-export'),
                    btnImport: document.getElementById('btn-import'),
                    btnArchive: document.getElementById('btn-archive'),
                    fileInput: document.getElementById('importFile'),
                    timePicker: document.getElementById('time-picker-popover'),
                    timePickerHours: document.getElementById('time-picker-hours'),
                    timePickerMinutes: document.getElementById('time-picker-minutes')
                },

                async init() {
                    this.bindEvents();
                    this.bindPickers();
                    this.bindTimePicker();
                    this.bindNoteAutosize();
                    this.renderAddingSteps();
                    this.setTaskInputExpanded(false);
                    this.resetDueInputs();
                    await this.loadData();
                    this.renderAll();
                    this.startTimer();
                },

                bindPickers() {
                    const inputs = [
                        this.dom.inpDate, this.dom.editInpDate
                    ];
                    inputs.forEach(el => {
                        el.addEventListener('click', (e) => {
                            if (typeof el.showPicker === 'function') {
                                try { el.showPicker(); } catch(err) {}
                            }
                        });
                    });
                    [this.dom.inpDate, this.dom.inpTime].forEach((el) => {
                        el.addEventListener('dblclick', () => {
                            if (el === this.dom.inpDate) {
                                this.dom.inpDate.value = '';
                                this.dom.inpTime.value = '';
                            } else {
                                this.dom.inpTime.value = '';
                            }
                        });
                    });
                    [this.dom.editInpDate, this.dom.editInpTime].forEach((el) => {
                        el.addEventListener('dblclick', () => {
                            if (el === this.dom.editInpDate) {
                                this.dom.editInpDate.value = '';
                                this.dom.editInpTime.value = '';
                            } else {
                                this.dom.editInpTime.value = '';
                            }
                        });
                    });
                },

                bindTimePicker() {
                    const createOption = (value, type) => {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.className = 'time-picker-option';
                        button.dataset.timeType = type;
                        button.dataset.timeValue = String(value).padStart(2, '0');
                        button.textContent = String(value).padStart(2, '0');
                        button.setAttribute('role', 'option');
                        button.setAttribute('aria-selected', 'false');
                        if (type === 'hour') button.title = '双击直接选择整点';
                        return button;
                    };

                    for (let hour = 0; hour < 24; hour += 1) {
                        this.dom.timePickerHours.appendChild(createOption(hour, 'hour'));
                    }
                    for (let minute = 0; minute < 60; minute += 5) {
                        this.dom.timePickerMinutes.appendChild(createOption(minute, 'minute'));
                    }

                    [this.dom.inpTime, this.dom.editInpTime].forEach((input) => {
                        input.addEventListener('click', (e) => {
                            e.stopPropagation();
                            this.openTimePicker(input);
                        });
                        input.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                this.openTimePicker(input);
                            }
                        });
                    });

                    this.dom.timePicker.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const option = e.target.closest('.time-picker-option');
                        if (!option) return;
                        if (option.dataset.timeType === 'hour') {
                            this.state.timePickerHour = option.dataset.timeValue;
                            this.syncTimePickerSelection();
                            return;
                        }
                        if (!this.state.timePickerTarget) return;
                        this.commitTimeSelection(option.dataset.timeValue);
                    });

                    this.dom.timePicker.addEventListener('dblclick', (e) => {
                        e.stopPropagation();
                        const option = e.target.closest('.time-picker-option[data-time-type="hour"]');
                        if (!option || !this.state.timePickerTarget) return;
                        this.state.timePickerHour = option.dataset.timeValue;
                        this.syncTimePickerSelection();
                        this.commitTimeSelection('00');
                    });

                    document.addEventListener('click', (e) => {
                        if (e.target.closest('.time-picker-input, .time-picker-popover')) return;
                        this.closeTimePicker();
                    });
                },

                openTimePicker(input) {
                    const match = /^(\d{2}):(\d{2})$/.exec(input.value);
                    const now = new Date();
                    this.state.timePickerTarget = input;
                    this.state.timePickerHour = match ? match[1] : String(now.getHours()).padStart(2, '0');
                    const selectedMinute = match ? match[2] : '00';

                    this.dom.timePicker.dataset.selectedMinute = selectedMinute;
                    this.syncTimePickerSelection();
                    this.dom.timePicker.classList.add('open');
                    this.dom.timePicker.setAttribute('aria-hidden', 'false');
                    input.setAttribute('aria-expanded', 'true');

                    const rect = input.getBoundingClientRect();
                    const pickerWidth = this.dom.timePicker.offsetWidth || 224;
                    const pickerHeight = this.dom.timePicker.offsetHeight || 302;
                    const gap = 8;
                    const left = Math.min(
                        Math.max(gap, rect.left),
                        Math.max(gap, window.innerWidth - pickerWidth - gap)
                    );
                    const placeAbove = rect.bottom + pickerHeight + gap > window.innerHeight
                        && rect.top > pickerHeight + gap;
                    const top = placeAbove
                        ? Math.max(gap, rect.top - pickerHeight - gap)
                        : Math.min(rect.bottom + gap, window.innerHeight - pickerHeight - gap);
                    this.dom.timePicker.style.left = `${left}px`;
                    this.dom.timePicker.style.top = `${Math.max(gap, top)}px`;

                    requestAnimationFrame(() => {
                        const selectedHourButton = this.dom.timePickerHours.querySelector('.selected');
                        if (selectedHourButton) {
                            this.dom.timePickerHours.scrollTop = selectedHourButton.offsetTop
                                - (this.dom.timePickerHours.clientHeight / 2)
                                + (selectedHourButton.offsetHeight / 2);
                        }
                        const selectedMinuteButton = this.dom.timePickerMinutes.querySelector('.selected');
                        if (selectedMinuteButton) {
                            this.dom.timePickerMinutes.scrollTop = selectedMinuteButton.offsetTop
                                - (this.dom.timePickerMinutes.clientHeight / 2)
                                + (selectedMinuteButton.offsetHeight / 2);
                        }
                    });
                },

                syncTimePickerSelection() {
                    const selectedMinute = this.dom.timePicker.dataset.selectedMinute || '';
                    this.dom.timePicker.querySelectorAll('.time-picker-option').forEach((option) => {
                        const isSelected = option.dataset.timeType === 'hour'
                            ? option.dataset.timeValue === this.state.timePickerHour
                            : option.dataset.timeValue === selectedMinute;
                        option.classList.toggle('selected', isSelected);
                        option.setAttribute('aria-selected', String(isSelected));
                    });
                },

                commitTimeSelection(minute) {
                    if (!this.state.timePickerTarget) return;
                    const hour = this.state.timePickerHour || '00';
                    this.state.timePickerTarget.value = `${hour}:${minute}`;
                    this.state.timePickerTarget.dispatchEvent(new Event('input', { bubbles: true }));
                    this.state.timePickerTarget.dispatchEvent(new Event('change', { bubbles: true }));
                    this.closeTimePicker();
                },

                closeTimePicker() {
                    if (!this.dom.timePicker.classList.contains('open')) return;
                    if (this.state.timePickerTarget) {
                        this.state.timePickerTarget.setAttribute('aria-expanded', 'false');
                    }
                    this.dom.timePicker.classList.remove('open');
                    this.dom.timePicker.setAttribute('aria-hidden', 'true');
                    this.state.timePickerTarget = null;
                    this.state.timePickerHour = null;
                    this.dom.timePicker.dataset.selectedMinute = '';
                },

                autoResizeTextarea(el) {
                    if (!el) return;
                    el.style.height = 'auto';
                    el.style.height = `${el.scrollHeight}px`;
                },

                bindNoteAutosize() {
                    if (this.dom.inpNote) this.dom.inpNote.addEventListener('input', () => this.autoResizeTextarea(this.dom.inpNote));
                    this.dom.editInpNote.addEventListener('input', () => this.autoResizeTextarea(this.dom.editInpNote));
                    if (this.dom.inpNote) this.autoResizeTextarea(this.dom.inpNote);
                    this.autoResizeTextarea(this.dom.editInpNote);
                },

                bindEvents() {
                    this.dom.navList.addEventListener('click', (e) => {
                        const deleteBtn = e.target.closest('.btn-icon-hover.delete');
                        const editBtn = e.target.closest('.btn-icon-hover.edit-list');
                        const item = e.target.closest('.nav-item');
                        
                        if (deleteBtn && item) {
                            e.stopPropagation();
                            this.deleteList(item.dataset.id);
                            return;
                        }
                        if (editBtn && item) {
                            e.stopPropagation();
                            this.openListEditModal(item.dataset.id);
                            return;
                        }
                        if (item) this.switchList(item.dataset.id);
                    });

                    // Drag & Drop logic omitted for brevity (same as previous)
                    this.dom.navList.addEventListener('dragstart', (e) => {
                        const item = e.target.closest('.nav-item');
                        if (item && item.draggable) {
                            this.state.draggedListId = item.dataset.id;
                            item.classList.add('dragging');
                        }
                    });
                    this.dom.navList.addEventListener('dragend', (e) => {
                        const item = e.target.closest('.nav-item');
                        if (item) item.classList.remove('dragging');
                        this.state.draggedListId = null;
                        this.renderSidebar();
                    });
                    this.dom.navList.addEventListener('dragover', (e) => {
                        e.preventDefault();
                        const item = e.target.closest('.nav-item');
                        if (item && item.dataset.type === 'custom' && this.state.draggedListId) {
                            item.classList.add('drag-over');
                            Array.from(this.dom.navList.children).forEach(child => {
                                if (child !== item) child.classList.remove('drag-over');
                            });
                        }
                    });
                    this.dom.navList.addEventListener('drop', (e) => {
                        e.preventDefault();
                        const targetItem = e.target.closest('.nav-item');
                        if (targetItem && targetItem.dataset.type === 'custom' && this.state.draggedListId) {
                            this.reorderLists(this.state.draggedListId, targetItem.dataset.id);
                        }
                    });

                    this.dom.newListInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.isComposing) {
                            const val = this.dom.newListInput.value.trim();
                            if(val) {
                                this.createList(val);
                                this.dom.newListInput.value = '';
                            }
                        }
                    });
                    this.dom.taskInputWrapper.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && e.shiftKey && !e.isComposing) {
                            e.preventDefault();
                            this.addTask();
                        }
                    });

                    const addTaskOnEnter = (e) => { 
                        if (e.key === 'Enter' && !e.isComposing) {
                            e.preventDefault();
                            this.addTask(); 
                        }
                    };
                    this.dom.inpText.addEventListener('keydown', addTaskOnEnter);
                    this.dom.inpText.addEventListener('focus', () => this.setTaskInputExpanded(true));
                    [this.dom.inpDate, this.dom.inpTime, this.dom.editInpDate, this.dom.editInpTime].forEach((el) => {
                        el.addEventListener('keydown', (e) => {
                            if (e.key !== 'Backspace' && e.key !== 'Delete') return;
                            e.preventDefault();
                            if (el === this.dom.inpDate) {
                                this.dom.inpDate.value = '';
                                this.dom.inpTime.value = '';
                            } else if (el === this.dom.editInpDate) {
                                this.dom.editInpDate.value = '';
                                this.dom.editInpTime.value = '';
                            } else {
                                el.value = '';
                            }
                        });
                    });
                    [this.dom.inpDate, this.dom.inpTime].forEach((el) => {
                        el.addEventListener('focus', () => {
                            this.state.skipNextAutoCollapse = true;
                        });
                    });

                    this.dom.btnAdd.addEventListener('click', () => this.addTask());
                    this.dom.btnCollapseInput.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.setTaskInputExpanded(false);
                        this.dom.inpText.blur();
                        this.dom.inpStepInput.blur();
                    });
                    this.dom.btnClearTaskTimeX.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.dom.inpDate.value = '';
                        this.dom.inpTime.value = '';
                        this.dom.inpDate.blur();
                        this.dom.inpTime.blur();
                    });
                    this.dom.dueQuickInline.addEventListener('click', (e) => {
                        const dueBtn = e.target.closest('[data-due-quick]');
                        if (dueBtn) {
                            this.applyAddQuickDue(dueBtn.dataset.dueQuick);
                            return;
                        }
                        const timeBtn = e.target.closest('[data-due-time]');
                        if (timeBtn) {
                            this.applyAddQuickTime(timeBtn.dataset.dueTime);
                        }
                    });
                    this.dom.editDueQuickInline.addEventListener('click', (e) => {
                        const dueBtn = e.target.closest('[data-due-quick]');
                        if (dueBtn) {
                            this.applyEditQuickDue(dueBtn.dataset.dueQuick);
                            return;
                        }
                        const timeBtn = e.target.closest('[data-due-time]');
                        if (timeBtn) {
                            this.applyEditQuickTime(timeBtn.dataset.dueTime);
                        }
                    });
                    this.dom.btnClearEditTimeX.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.dom.editInpDate.value = '';
                        this.dom.editInpTime.value = '';
                        this.dom.editInpDate.blur();
                        this.dom.editInpTime.blur();
                    });
                    this.dom.inpStepInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
                            e.preventDefault();
                            this.addAddingStep(this.dom.inpStepInput.value);
                            this.dom.inpStepInput.value = '';
                        }
                    });
                    this.dom.inpStepList.addEventListener('click', (e) => {
                        const delBtn = e.target.closest('.edit-step-delete');
                        if (delBtn) {
                            const stepId = parseInt(delBtn.dataset.stepId);
                            this.deleteAddingStep(stepId);
                            this.dom.inpStepInput.focus();
                            return;
                        }
                    });
                    this.dom.inpStepList.addEventListener('input', (e) => {
                        const input = e.target.closest('.step-edit-input[data-context="add"]');
                        if (!input) return;
                        const stepId = parseInt(input.dataset.stepId);
                        this.updateAddingStepText(stepId, input.value);
                    });
                    this.dom.inpStepList.addEventListener('keydown', (e) => {
                        const input = e.target.closest('.step-edit-input[data-context="add"]');
                        if (!input) return;
                        if (e.key === 'Enter' && !e.isComposing) {
                            e.preventDefault();
                            this.dom.inpStepInput.focus();
                        } else if (e.key === 'Escape') {
                            e.preventDefault();
                            input.blur();
                        }
                    });
                    this.dom.inpStepAddRow.addEventListener('click', () => {
                        this.dom.inpStepInput.focus();
                    });
                    this.dom.taskInputWrapper.addEventListener('focusin', () => {
                        this.setTaskInputExpanded(true);
                    });
                    this.dom.taskInputWrapper.addEventListener('focusout', () => {
                        setTimeout(() => {
                            if (this.dom.taskInputWrapper.contains(document.activeElement)) return;
                            if (this.state.skipNextAutoCollapse) {
                                this.state.skipNextAutoCollapse = false;
                                return;
                            }
                            if (this.hasAddTaskDraft()) return;
                            this.setTaskInputExpanded(false);
                        }, 0);
                    });
                    
                    this.dom.btnToggleCompleted.addEventListener('click', () => {
                        this.state.showCompleted = !this.state.showCompleted;
                        this.updateToggleButtons();
                        this.renderTasks();
                    });

                    this.dom.btnToggleNotes.addEventListener('click', () => {
                        this.state.showDetails = !this.state.showDetails;
                        // Reset per-card overrides when switching global detail mode
                        this.state.expandedTaskIds = [];
                        this.updateToggleButtons();
                        this.renderTasks();
                    });

                    this.dom.btnNewMemo.addEventListener('click', () => this.createMemo());
                    this.dom.memoList.addEventListener('click', (e) => {
                        const item = e.target.closest('.memo-list-item');
                        if (!item) return;
                        this.openMemoModal(parseInt(item.dataset.id, 10));
                    });
                    this.dom.memoTitleInput.addEventListener('input', () => this.updateCurrentMemo({
                        title: this.dom.memoTitleInput.value
                    }));
                    this.dom.memoContentInput.addEventListener('input', () => this.updateCurrentMemo({
                        content: this.dom.memoContentInput.value
                    }));
                    this.dom.btnExpandMemo.addEventListener('click', () => this.toggleMemoModalExpanded());
                    this.dom.btnDeleteMemo.addEventListener('click', () => this.deleteCurrentMemo());
                    this.dom.btnCloseMemo.addEventListener('click', () => this.closeModals());

                    this.dom.sidebarSearchInput.addEventListener('input', () => {
                        this.state.sidebarSearchKeyword = this.dom.sidebarSearchInput.value.trim().toLowerCase();
                        this.renderAll();
                    });
                    this.dom.sidebarSearchClear.addEventListener('click', () => {
                        this.state.sidebarSearchKeyword = '';
                        this.dom.sidebarSearchInput.value = '';
                        this.renderAll();
                    });
                    this.dom.sortMode.addEventListener('change', () => {
                        this.state.sortMode = this.dom.sortMode.value;
                        this.renderTasks();
                    });
                    this.dom.btnClearSort.addEventListener('click', () => {
                        this.state.sortMode = 'default';
                        this.syncFilterControls();
                        this.renderTasks();
                    });

                    this.dom.taskList.addEventListener('click', (e) => {
                        const el = e.target;
                        const item = el.closest('.task-item');
                        if (!item) return;
                        const id = parseInt(item.dataset.id);

                        if (el.closest('.custom-checkbox')) {
                            e.stopPropagation();
                            this.toggleTask(id);
                        } else if (el.closest('.btn-action-important')) {
                            e.stopPropagation();
                            this.toggleImportant(id);
                        } else if (el.closest('.btn-action-myday')) {
                            e.stopPropagation();
                            this.toggleMyDay(id);
                        } else if (el.closest('.step-checkbox')) {
                            e.stopPropagation();
                            const stepId = parseInt(el.closest('.step-checkbox').dataset.stepId);
                            this.toggleStep(id, stepId);
                        } else if (el.closest('.step-delete')) {
                            e.stopPropagation();
                            const stepId = parseInt(el.closest('.step-delete').dataset.stepId);
                            this.deleteStep(id, stepId);
                        } else if (el.closest('.btn-action.delete')) {
                            e.stopPropagation();
                            this.deleteTask(id);
                        } else if (el.closest('.btn-action.edit')) {
                            e.stopPropagation();
                            this.openTaskEditModal(id);
                        } else {
                            const selection = window.getSelection ? window.getSelection() : null;
                            if (selection && selection.toString().trim()) return;
                            this.toggleExpandedTask(id);
                        }
                    });

                    this.dom.btnsCancel.forEach(btn => btn.addEventListener('click', () => this.closeModals()));
                    this.dom.btnSaveTask.addEventListener('click', () => this.saveEditedTask());
                    this.dom.btnSaveList.addEventListener('click', () => this.saveListRename());
                    this.dom.editStepInput.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' && !e.isComposing) {
                            e.preventDefault();
                            this.addEditingStep(this.dom.editStepInput.value);
                            this.dom.editStepInput.value = '';
                        }
                    });
                    this.dom.editStepList.addEventListener('click', (e) => {
                        const checkbox = e.target.closest('.step-checkbox');
                        if (checkbox) {
                            const stepId = parseInt(checkbox.dataset.stepId);
                            this.toggleEditingStep(stepId);
                            this.dom.editStepInput.focus();
                            return;
                        }
                        const delBtn = e.target.closest('.edit-step-delete');
                        if (delBtn) {
                            const stepId = parseInt(delBtn.dataset.stepId);
                            this.deleteEditingStep(stepId);
                            this.dom.editStepInput.focus();
                            return;
                        }
                    });
                    this.dom.editStepList.addEventListener('input', (e) => {
                        const input = e.target.closest('.step-edit-input[data-context="edit"]');
                        if (!input) return;
                        const stepId = parseInt(input.dataset.stepId);
                        this.updateEditingStepText(stepId, input.value);
                    });
                    this.dom.editStepList.addEventListener('keydown', (e) => {
                        const input = e.target.closest('.step-edit-input[data-context="edit"]');
                        if (!input) return;
                        if (e.key === 'Enter' && !e.isComposing) {
                            e.preventDefault();
                            this.dom.editStepInput.focus();
                        } else if (e.key === 'Escape') {
                            e.preventDefault();
                            input.blur();
                        }
                    });
                    this.dom.editStepAddRow.addEventListener('click', () => {
                        this.dom.editStepInput.focus();
                    });
                    
                    document.addEventListener('keydown', (e) => {
                        if (e.key !== 'Escape') return;
                        if (this.dom.timePicker.classList.contains('open')) {
                            this.closeTimePicker();
                            return;
                        }
                        if (this.dom.modalOverlay.classList.contains('open')) this.closeModals();
                    });
                    this.dom.modalOverlay.addEventListener('click', (e) => {
                        if (e.target === this.dom.modalOverlay) this.closeModals();
                    });
                    this.dom.editInpListName.addEventListener('keydown', (e) => {
                        if(e.key === 'Enter' && !e.isComposing) this.saveListRename();
                    });

                    this.dom.btnExport.addEventListener('click', () => this.exportData());
                    this.dom.btnImport.addEventListener('click', () => this.dom.fileInput.click());
                    this.dom.fileInput.addEventListener('change', (e) => this.importData(e.target));
                    this.dom.btnArchive.addEventListener('click', () => this.archiveDataToCsv());
                },

                updateToggleButtons() {
                    this.dom.btnToggleCompleted.classList.toggle('active', !this.state.showCompleted);
                    this.dom.txtToggleCompleted.textContent = this.state.showCompleted ? '隐藏已完成' : '展示已完成任务';
                    this.dom.btnToggleNotes.classList.toggle('active', this.state.showDetails);
                    this.dom.txtToggleNotes.textContent = this.state.showDetails ? '隐藏详情' : '展示详情';
                },

                updateSidebarSearchUI() {
                    this.dom.sidebarSearchWrap.classList.toggle('has-value', !!this.state.sidebarSearchKeyword);
                },

                setTaskInputExpanded(expanded) {
                    const isExpanded = this.dom.taskInputWrapper.classList.contains('expanded');
                    if (isExpanded === expanded) return;
                    this.dom.taskInputWrapper.classList.toggle('collapsed', !expanded);
                    this.dom.taskInputWrapper.classList.toggle('expanded', expanded);
                },

                updateAddStepInputPlaceholder() {
                    this.dom.inpStepInput.placeholder = this.state.addingSteps.length > 0 ? '下一步' : '添加步骤';
                },

                renderAddingSteps() {
                    const steps = Array.isArray(this.state.addingSteps) ? this.state.addingSteps : [];
                    this.dom.inpStepList.innerHTML = steps.map(step => `
                        <li class="step-item">
                            <div class="edit-step-main">
                                <button class="step-checkbox" disabled title="步骤"></button>
                                <input class="step-edit-input" data-context="add" data-step-id="${step.id}" value="${this.escapeHtml(step.text)}" />
                            </div>
                            <button class="edit-step-delete" data-step-id="${step.id}" title="删除步骤">
                                <svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                        </li>
                    `).join('');
                    this.updateAddStepInputPlaceholder();
                },

                addAddingStep(stepText) {
                    const text = (stepText || '').trim();
                    if (!text) return;
                    this.state.addingSteps.push({ id: Date.now(), text });
                    this.renderAddingSteps();
                    this.dom.inpStepInput.focus();
                    this.dom.inpStepList.scrollTop = this.dom.inpStepList.scrollHeight;
                },

                deleteAddingStep(stepId) {
                    this.state.addingSteps = this.state.addingSteps.filter(s => s.id !== stepId);
                    if (this.state.addingStepEditId === stepId) this.state.addingStepEditId = null;
                    this.renderAddingSteps();
                },

                updateAddingStepText(stepId, stepText) {
                    const step = this.state.addingSteps.find(s => s.id === stepId);
                    if (!step) return;
                    step.text = stepText;
                },

                startAddingStepEdit(stepId) {
                    if (Number.isNaN(stepId)) return;
                    this.state.addingStepEditId = stepId;
                    this.renderAddingSteps();
                },

                finishAddingStepEdit(stepId, stepText) {
                    if (this.state.addingStepEditId !== stepId) return;
                    const step = this.state.addingSteps.find(s => s.id === stepId);
                    if (!step) {
                        this.state.addingStepEditId = null;
                        return;
                    }
                    const text = (stepText || '').trim();
                    if (text) step.text = text;
                    this.state.addingStepEditId = null;
                    this.renderAddingSteps();
                },

                cancelAddingStepEdit() {
                    this.state.addingStepEditId = null;
                    this.renderAddingSteps();
                },

                hasAddTaskDraft() {
                    return !!(
                        this.dom.inpText.value.trim() ||
                        (this.dom.inpNote ? this.dom.inpNote.value.trim() : '') ||
                        this.dom.inpDate.value ||
                        this.dom.inpTime.value ||
                        this.state.addingSteps.length > 0
                    );
                },

                toDateInputValue(dateObj) {
                    const y = dateObj.getFullYear();
                    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
                    const d = String(dateObj.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                },

                applyAddQuickDue(mode) {
                    const dateVal = this.getQuickDueDateValue(mode);
                    if (!dateVal) return;
                    this.dom.inpDate.value = dateVal;
                },

                applyEditQuickDue(mode) {
                    const dateVal = this.getQuickDueDateValue(mode);
                    if (!dateVal) return;
                    this.dom.editInpDate.value = dateVal;
                },

                getQuickDueDateValue(mode) {
                    const now = new Date();
                    now.setHours(0, 0, 0, 0);
                    const target = new Date(now);
                    if (mode === 'today') {
                        // keep target as today
                    } else if (mode === 'tomorrow') {
                        target.setDate(target.getDate() + 1);
                    } else if (mode === 'this-week') {
                        const day = target.getDay();
                        const delta = day === 0 ? 5 : 5 - day;
                        target.setDate(target.getDate() + delta);
                    } else if (mode === 'next-week') {
                        const day = target.getDay();
                        const thisWeekFridayDelta = day === 0 ? 5 : 5 - day;
                        const delta = thisWeekFridayDelta + 7;
                        target.setDate(target.getDate() + delta);
                    } else {
                        return '';
                    }
                    return this.toDateInputValue(target);
                },

                applyAddQuickTime(mode) {
                    if (mode === 'midday') {
                        this.dom.inpTime.value = '12:00';
                    }
                    if (mode === 'offwork') {
                        this.dom.inpTime.value = '17:30';
                    }
                },
                applyEditQuickTime(mode) {
                    if (mode === 'midday') {
                        this.dom.editInpTime.value = '12:00';
                    }
                    if (mode === 'offwork') {
                        this.dom.editInpTime.value = '17:30';
                    }
                },

                resetDueInputs() {
                    this.dom.inpDate.value = '';
                    this.dom.inpTime.value = '';
                },

                isMemoView() {
                    return this.state.currentListId === 'memos';
                },

                formatMemoTimestamp(timestamp) {
                    const d = new Date(timestamp || Date.now());
                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    return `${d.getMonth() + 1}月${d.getDate()}日 ${hh}:${mm}`;
                },

                getMemoTitle(memo) {
                    const title = (memo && memo.title ? memo.title : '').trim();
                    return title || '无标题备忘录';
                },

                getMemoPreview(memo) {
                    const text = `${memo.title || ''}\n${memo.content || ''}`.trim();
                    return text || '这条备忘录还是空的，点进来写点什么吧。';
                },

                getFilteredMemos() {
                    let memos = Array.isArray(this.db.memos) ? [...this.db.memos] : [];
                    if (this.state.sidebarSearchKeyword) {
                        const keyword = this.state.sidebarSearchKeyword;
                        memos = memos.filter((memo) => {
                            const haystack = `${memo.title || ''}\n${memo.content || ''}`.toLowerCase();
                            return haystack.includes(keyword);
                        });
                    }
                    return memos.sort((a, b) => (b.updatedAt || b.createdAt || b.id) - (a.updatedAt || a.createdAt || a.id));
                },

                ensureActiveMemo() {
                    const memos = Array.isArray(this.db.memos) ? this.db.memos : [];
                    if (!memos.length) {
                        this.state.currentMemoId = null;
                        return null;
                    }
                    const hasCurrent = memos.find((memo) => memo.id === this.state.currentMemoId);
                    if (hasCurrent) return hasCurrent;
                    const fallback = this.getFilteredMemos()[0] || memos[0];
                    this.state.currentMemoId = fallback ? fallback.id : null;
                    return fallback || null;
                },

                createMemo() {
                    const nowTs = Date.now();
                    const memo = {
                        id: nowTs,
                        title: '',
                        content: '',
                        createdAt: nowTs,
                        updatedAt: nowTs
                    };
                    this.db.memos.unshift(memo);
                    this.state.currentMemoId = memo.id;
                    this.save();
                    if (!this.isMemoView()) this.state.currentListId = 'memos';
                    this.renderAll();
                    this.openMemoModal(memo.id);
                },

                selectMemo(id) {
                    this.state.currentMemoId = id;
                    this.renderMemos();
                },

                openMemoModal(id) {
                    this.state.currentMemoId = id;
                    this.renderMemos();
                    this.openModal('memo');
                    this.syncMemoModalExpandedState();
                    this.syncMemoModal();
                    this.dom.memoTitleInput.focus();
                },

                toggleMemoModalExpanded() {
                    this.state.isMemoModalExpanded = !this.state.isMemoModalExpanded;
                    this.syncMemoModalExpandedState();
                },

                syncMemoModalExpandedState() {
                    this.dom.modalMemo.classList.toggle('expanded', this.state.isMemoModalExpanded);
                    this.dom.btnExpandMemo.title = this.state.isMemoModalExpanded ? '还原窗口' : '放大查看';
                },

                syncMemoModal() {
                    const memo = this.db.memos.find((item) => item.id === this.state.currentMemoId);
                    if (!memo) return;
                    this.dom.memoUpdatedAt.textContent = `更新于 ${this.formatMemoTimestamp(memo.updatedAt || memo.createdAt || memo.id)}`;
                    if (this.dom.memoTitleInput.value !== (memo.title || '')) {
                        this.dom.memoTitleInput.value = memo.title || '';
                    }
                    if (this.dom.memoContentInput.value !== (memo.content || '')) {
                        this.dom.memoContentInput.value = memo.content || '';
                    }
                },

                updateCurrentMemo(patch) {
                    const memo = this.db.memos.find((item) => item.id === this.state.currentMemoId);
                    if (!memo) return;
                    Object.assign(memo, patch, { updatedAt: Date.now() });
                    this.save();
                    this.renderMemos();
                    this.syncMemoModal();
                },

                deleteCurrentMemo() {
                    const memo = this.db.memos.find((item) => item.id === this.state.currentMemoId);
                    if (!memo) return;
                    const title = this.getMemoTitle(memo);
                    if (!confirm(`确认删除“${title}”吗？`)) return;
                    this.db.memos = this.db.memos.filter((item) => item.id !== memo.id);
                    this.state.currentMemoId = null;
                    this.save();
                    this.closeModals();
                    this.renderAll();
                },

                toggleExpandedTask(id) {
                    const idx = this.state.expandedTaskIds.indexOf(id);
                    if (idx > -1) this.state.expandedTaskIds.splice(idx, 1);
                    else this.state.expandedTaskIds.push(id);
                    this.state.clickedTaskId = id;
                    this.renderTasks();
                },

                isInMyDay(task) {
                    return !!task.inMyDay;
                },

                createList(title) {
                    const newList = { id: 'list_' + Date.now(), title: title, icon: 'list', type: 'custom' };
                    this.db.lists.push(newList);
                    this.save();
                    this.switchList(newList.id);
                },

                deleteList(id) {
                    if (confirm('确定删除此列表吗？该列表下的所有任务也将被删除。')) {
                        this.db.tasks = this.db.tasks.filter(t => t.listId !== id);
                        this.db.lists = this.db.lists.filter(l => l.id !== id);
                        if (this.state.currentListId === id) this.state.currentListId = 'my-day';
                        this.save();
                        this.renderAll();
                    }
                },

                openListEditModal(id) {
                    const list = this.db.lists.find(l => l.id === id);
                    if (!list) return;
                    this.state.editingListId = id;
                    this.dom.editInpListName.value = list.title;
                    this.openModal('list');
                    this.dom.editInpListName.focus();
                },

                saveListRename() {
                    if (!this.state.editingListId) return;
                    const newTitle = this.dom.editInpListName.value.trim();
                    if (!newTitle) return;
                    
                    const list = this.db.lists.find(l => l.id === this.state.editingListId);
                    if (list) {
                        list.title = newTitle;
                        this.save();
                        this.renderAll();
                        this.closeModals();
                    }
                },

                reorderLists(srcId, targetId) {
                    if (srcId === targetId) return;
                    const srcIndex = this.db.lists.findIndex(l => l.id === srcId);
                    const targetIndex = this.db.lists.findIndex(l => l.id === targetId);
                    if (srcIndex > -1 && targetIndex > -1) {
                        const [movedList] = this.db.lists.splice(srcIndex, 1);
                        this.db.lists.splice(targetIndex, 0, movedList);
                        this.save();
                        this.renderSidebar();
                    }
                },

                switchList(id) {
                    this.state.currentListId = id;
                    this.state.sidebarSearchKeyword = '';
                    this.state.expandedTaskIds = [];
                    this.state.clickedTaskId = null;
                    this.state.listSwitchedPulse = true;
                    this.resetDueInputs();
                    if (id === 'memos') this.ensureActiveMemo();
                    this.renderAll();
                },

                addTask() {
                    const text = this.dom.inpText.value.trim();
                    const note = this.dom.inpNote ? this.dom.inpNote.value.trim() : '';
                    const dateVal = this.dom.inpDate.value; 
                    const timeVal = this.dom.inpTime.value;
                    const recurrence = this.dom.inpRecurrence.value;
                    const selectedListId = this.dom.inpList.value;
                    const listId = this.state.currentListId === 'tasks' ? 'tasks' : selectedListId;

                    if (listId === 'weekly-overview') return;
                    
                    if (!text) { this.dom.inpText.focus(); return; }

                    let dueDate = null;
                    let hasTime = false;

                    if (dateVal) {
                        if (timeVal) {
                            dueDate = new Date(`${dateVal}T${timeVal}`).getTime();
                            hasTime = true;
                        } else {
                            dueDate = new Date(`${dateVal}T00:00:00`).getTime();
                            hasTime = false;
                        }
                    }

                    const nowTs = Date.now();
                    const newTask = {
                        id: nowTs,
                        text: text,
                        note: note,
                        listId: listId || 'my-day',
                        inMyDay: (listId || 'my-day') === 'my-day',
                        autoInMyDay: false,
                        important: false,
                        steps: this.state.addingSteps.map(s => ({ id: s.id, text: s.text, completed: false })),
                        dueDate: dueDate,
                        hasTime: hasTime,
                        recurrenceAnchorDay: dueDate ? new Date(dueDate).getDate() : null,
                        recurrence: recurrence,
                        completed: false,
                        completedAt: null,
                        created: nowTs,
                        addedAt: nowTs
                    };

                    this.db.tasks.unshift(newTask);
                    this.state.newlyAddedTaskIds = [newTask.id];
                    this.save();
                    this.dom.inpText.value = '';
                    if (this.dom.inpNote) {
                        this.dom.inpNote.value = '';
                        this.autoResizeTextarea(this.dom.inpNote);
                    }
                    this.state.addingSteps = [];
                    this.dom.inpStepInput.value = '';
                    this.renderAddingSteps();
                    this.resetDueInputs();
                    this.dom.inpRecurrence.value = 'none';
                    if (this.dom.taskInputWrapper.contains(document.activeElement) && document.activeElement && typeof document.activeElement.blur === 'function') {
                        document.activeElement.blur();
                    }
                    this.setTaskInputExpanded(false);
                    this.renderAll(); 
                },

                toggleTask(id) {
                    const task = this.db.tasks.find(t => t.id === id);
                    if (!task) return;
                    const wasCompleted = task.completed;
                    task.completed = !wasCompleted;
                    task.completedAt = task.completed ? Date.now() : null;
                    if (task.completed && Array.isArray(task.steps)) {
                        task.steps = task.steps.map(step => ({ ...step, completed: true }));
                    } else if (!task.completed && Array.isArray(task.steps)) {
                        task.steps = task.steps.map(step => ({ ...step, completed: false }));
                    }
                    if (!wasCompleted && task.completed && task.recurrence && task.recurrence !== 'none') {
                        const existingNextTask = task.nextRecurringTaskId
                            ? this.db.tasks.find(t => t.id === task.nextRecurringTaskId)
                            : null;
                        if (!existingNextTask) this.createNextRecurringTask(task);
                    }
                    this.save();
                    this.renderTasks();
                    this.renderSidebar();
                },

                toggleImportant(id) {
                    const task = this.db.tasks.find(t => t.id === id);
                    if (!task) return;
                    task.important = !task.important;
                    this.save();
                    this.renderAll();
                },

                toggleMyDay(id) {
                    const task = this.db.tasks.find(t => t.id === id);
                    if (!task) return;
                    task.inMyDay = !this.isInMyDay(task);
                    task.autoInMyDay = false;
                    this.save();
                    this.renderAll();
                },

                addStep(taskId, stepText) {
                    const text = (stepText || '').trim();
                    if (!text) return;
                    const task = this.db.tasks.find(t => t.id === taskId);
                    if (!task) return;
                    if (!Array.isArray(task.steps)) task.steps = [];
                    task.steps.push({ id: Date.now(), text: text, completed: false });
                    if (!this.state.expandedTaskIds.includes(taskId)) this.state.expandedTaskIds.push(taskId);
                    this.save();
                    this.renderTasks();
                },

                toggleStep(taskId, stepId) {
                    const task = this.db.tasks.find(t => t.id === taskId);
                    if (!task || !Array.isArray(task.steps)) return;
                    const step = task.steps.find(s => s.id === stepId);
                    if (!step) return;
                    step.completed = !step.completed;
                    this.save();
                    this.renderTasks();
                },

                deleteStep(taskId, stepId) {
                    const task = this.db.tasks.find(t => t.id === taskId);
                    if (!task || !Array.isArray(task.steps)) return;
                    task.steps = task.steps.filter(s => s.id !== stepId);
                    this.save();
                    this.renderTasks();
                },

                createNextRecurringTask(originalTask) {
                    const baseTime = originalTask.dueDate || Date.now();
                    const oldDate = new Date(baseTime);
                    if (Number.isNaN(oldDate.getTime())) return;
                    const recurrenceAnchorDay = originalTask.recurrenceAnchorDay || oldDate.getDate();
                    const newDate = window.TodoRecurrence.getNextDueDate(
                        oldDate,
                        originalTask.recurrence,
                        recurrenceAnchorDay
                    );
                    if (!newDate) return;
                    const nextDueDate = originalTask.dueDate ? newDate.getTime() : null;
                    const shouldBeInMyDay = nextDueDate ? this.isSameDay(new Date(nextDueDate), new Date()) : false;
                    const nextTaskId = Date.now();
                    const newTask = {
                        ...originalTask,
                        id: nextTaskId,
                        nextRecurringTaskId: null,
                        dueDate: nextDueDate,
                        recurrenceAnchorDay: nextDueDate ? recurrenceAnchorDay : null,
                        inMyDay: shouldBeInMyDay,
                        autoInMyDay: shouldBeInMyDay,
                        hasTime: originalTask.dueDate ? !!originalTask.hasTime : false,
                        steps: Array.isArray(originalTask.steps)
                            ? originalTask.steps.map(step => ({ ...step, completed: false }))
                            : [],
                        completed: false,
                        completedAt: null,
                        created: Date.now(),
                        addedAt: Date.now()
                    };
                    originalTask.nextRecurringTaskId = nextTaskId;
                    this.db.tasks.unshift(newTask);
                },

                deleteTask(id) {
                    if(confirm('确定删除此任务吗？')) {
                        this.db.tasks = this.db.tasks.filter(t => t.id !== id);
                        this.state.expandedTaskIds = this.state.expandedTaskIds.filter(taskId => taskId !== id);
                        this.save();
                        this.renderAll();
                    }
                },

                openModal(type) {
                    this.dom.modalOverlay.classList.add('open');
                    this.dom.modalTask.style.display = type === 'task' ? 'flex' : 'none';
                    this.dom.modalList.style.display = type === 'list' ? 'flex' : 'none';
                    this.dom.modalMemo.style.display = type === 'memo' ? 'flex' : 'none';
                },

                closeModals() {
                    this.closeTimePicker();
                    this.dom.modalOverlay.classList.remove('open');
                    this.dom.modalMemo.style.display = 'none';
                    this.state.isMemoModalExpanded = false;
                    this.syncMemoModalExpandedState();
                    this.state.editingTaskId = null;
                    this.state.editingListId = null;
                    this.state.editingSteps = [];
                    this.state.editingStepEditId = null;
                },

                updateEditStepInputPlaceholder() {
                    const hasSteps = Array.isArray(this.state.editingSteps) && this.state.editingSteps.length > 0;
                    this.dom.editStepInput.placeholder = hasSteps ? '下一步' : '添加步骤';
                },

                renderEditingSteps() {
                    const steps = Array.isArray(this.state.editingSteps) ? this.state.editingSteps : [];
                    this.dom.editStepList.innerHTML = steps.map(step => `
                        <li class="step-item ${step.completed ? 'done' : ''}">
                            <div class="edit-step-main">
                                <button class="step-checkbox" data-step-id="${step.id}" title="完成步骤"></button>
                                <input class="step-edit-input" data-context="edit" data-step-id="${step.id}" value="${this.escapeHtml(step.text)}" />
                            </div>
                            <button class="edit-step-delete" data-step-id="${step.id}" title="删除步骤">
                                <svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                            </button>
                        </li>
                    `).join('');
                    this.updateEditStepInputPlaceholder();
                },

                addEditingStep(stepText) {
                    const text = (stepText || '').trim();
                    if (!text) return;
                    this.state.editingSteps.push({ id: Date.now(), text: text, completed: false });
                    this.state.editingStepEditId = null;
                    this.renderEditingSteps();
                    this.dom.editStepInput.focus();
                    this.dom.editStepList.scrollTop = this.dom.editStepList.scrollHeight;
                },

                toggleEditingStep(stepId) {
                    const step = this.state.editingSteps.find(s => s.id === stepId);
                    if (!step) return;
                    step.completed = !step.completed;
                    this.renderEditingSteps();
                },

                deleteEditingStep(stepId) {
                    this.state.editingSteps = this.state.editingSteps.filter(s => s.id !== stepId);
                    if (this.state.editingStepEditId === stepId) this.state.editingStepEditId = null;
                    this.renderEditingSteps();
                },

                updateEditingStepText(stepId, stepText) {
                    const step = this.state.editingSteps.find(s => s.id === stepId);
                    if (!step) return;
                    step.text = stepText;
                },

                startEditingStepEdit(stepId) {
                    if (Number.isNaN(stepId)) return;
                    this.state.editingStepEditId = stepId;
                    this.renderEditingSteps();
                },

                finishEditingStepEdit(stepId, stepText) {
                    if (this.state.editingStepEditId !== stepId) return;
                    const step = this.state.editingSteps.find(s => s.id === stepId);
                    if (!step) {
                        this.state.editingStepEditId = null;
                        return;
                    }
                    const text = (stepText || '').trim();
                    if (text) step.text = text;
                    this.state.editingStepEditId = null;
                    this.renderEditingSteps();
                },

                cancelEditingStepEdit() {
                    this.state.editingStepEditId = null;
                    this.renderEditingSteps();
                },

                openTaskEditModal(id) {
                    const task = this.db.tasks.find(t => t.id === id);
                    if (!task) return;
                    this.state.editingTaskId = id;
                    this.dom.editInpText.value = task.text;
                    this.dom.editInpNote.value = task.note || '';
                    this.autoResizeTextarea(this.dom.editInpNote);
                    this.dom.editInpRecurrence.value = task.recurrence || 'none';
                    
                    if (task.dueDate) {
                        const d = new Date(task.dueDate);
                        const year = d.getFullYear();
                        const month = String(d.getMonth() + 1).padStart(2, '0');
                        const day = String(d.getDate()).padStart(2, '0');
                        this.dom.editInpDate.value = `${year}-${month}-${day}`;
                        if (task.hasTime) {
                            const hours = String(d.getHours()).padStart(2, '0');
                            const mins = String(d.getMinutes()).padStart(2, '0');
                            this.dom.editInpTime.value = `${hours}:${mins}`;
                        } else {
                            this.dom.editInpTime.value = '';
                        }
                    } else {
                        this.dom.editInpDate.value = '';
                        this.dom.editInpTime.value = '';
                    }

                    this.dom.editInpList.innerHTML = '';
                    this.db.lists.forEach(l => {
                        if (l.id !== 'important' && l.id !== 'weekly-overview' && l.id !== 'memos') {
                            const opt = document.createElement('option');
                            opt.value = l.id;
                            opt.textContent = l.title;
                            this.dom.editInpList.appendChild(opt);
                        }
                    });
                    this.dom.editInpList.value = task.listId === 'memos' ? 'tasks' : task.listId;
                    this.state.editingSteps = Array.isArray(task.steps) ? task.steps.map(s => ({ ...s })) : [];
                    this.state.editingStepEditId = null;
                    this.renderEditingSteps();
                    this.openModal('task');
                    this.dom.editInpText.focus();
                },

                saveEditedTask() {
                    if (!this.state.editingTaskId) return;
                    const newText = this.dom.editInpText.value.trim();
                    if (!newText) { alert('任务内容不能为空'); return; }

                    const task = this.db.tasks.find(t => t.id === this.state.editingTaskId);
                    if (task) {
                        const wasInMyDay = !!task.inMyDay;
                        const wasAutoInMyDay = !!task.autoInMyDay;
                        const previousDueDate = task.dueDate;
                        const previousAnchorDay = task.recurrenceAnchorDay;
                        task.text = newText;
                        task.note = this.dom.editInpNote.value; 
                        task.listId = this.dom.editInpList.value;
                        task.recurrence = this.dom.editInpRecurrence.value;
                        task.steps = this.state.editingSteps.map(s => ({ ...s }));
                        
                        const dateVal = this.dom.editInpDate.value;
                        const timeVal = this.dom.editInpTime.value;

                        if (dateVal) {
                            if (timeVal) {
                                task.dueDate = new Date(`${dateVal}T${timeVal}`).getTime();
                                task.hasTime = true;
                            } else {
                                task.dueDate = new Date(`${dateVal}T00:00:00`).getTime();
                                task.hasTime = false;
                            }
                        } else {
                            task.dueDate = null;
                            task.hasTime = false;
                        }
                        const dueDateWasUnchanged = previousDueDate && task.dueDate
                            && this.formatDateYmd(previousDueDate) === this.formatDateYmd(task.dueDate);
                        task.recurrenceAnchorDay = dueDateWasUnchanged && previousAnchorDay
                            ? previousAnchorDay
                            : (task.dueDate ? new Date(task.dueDate).getDate() : null);

                        if (task.listId === 'my-day') {
                            task.inMyDay = true;
                            task.autoInMyDay = false;
                        } else if (this.isDueToday(task)) {
                            if (!task.inMyDay) task.inMyDay = true;
                            if (!wasInMyDay || wasAutoInMyDay) task.autoInMyDay = true;
                        } else if (wasAutoInMyDay) {
                            task.inMyDay = false;
                            task.autoInMyDay = false;
                        }
                        
                        this.save();
                        this.renderAll();
                        this.closeModals();
                    }
                },

                renderAll() {
                    this.syncDueTodayTasksToMyDay();
                    this.renderHeader();
                    this.renderSidebar();
                    this.updateInputSelect();
                    this.syncFilterControls();
                    this.updateToggleButtons();
                    this.updateSidebarSearchUI();
                    if (this.isMemoView()) {
                        this.dom.taskList.innerHTML = '';
                        this.renderMemos();
                    } else {
                        this.renderTasks();
                    }

                    const hideTaskInput = this.state.currentListId === 'weekly-overview' || this.isMemoView();
                    this.dom.taskInputWrapper.style.display = hideTaskInput ? 'none' : 'flex';
                    this.dom.memoPage.style.display = this.isMemoView() ? 'block' : 'none';
                    this.dom.taskList.parentElement.style.display = this.isMemoView() ? 'none' : 'block';
                    document.querySelector('.filter-toolbar').style.display = this.isMemoView() ? 'none' : 'flex';
                    this.dom.btnNewMemo.classList.toggle('is-hidden', !this.isMemoView());
                    this.dom.btnToggleCompleted.classList.toggle('is-hidden', this.isMemoView());
                    this.dom.btnToggleNotes.classList.toggle('is-hidden', this.isMemoView());
                },

                renderSidebar() {
                    const frag = document.createDocumentFragment();
                    let dividerInserted = false;
                    this.db.lists.forEach(list => {
                        if (!dividerInserted && list.type === 'custom') {
                            const divider = document.createElement('div');
                            divider.className = 'nav-divider';
                            frag.appendChild(divider);
                            dividerInserted = true;
                        }
                        const div = document.createElement('div');
                        const isActive = !this.state.sidebarSearchKeyword && list.id === this.state.currentListId;
                        const isSystem = list.type === 'system';
                        let count = 0;
                        if (list.id === 'tasks') {
                            count = this.db.tasks.filter(t => !t.completed).length;
                        } else if (list.id === 'important') {
                            count = this.db.tasks.filter(t => !t.completed && t.important).length;
                        } else if (list.id === 'weekly-overview') {
                            count = this.db.tasks.filter(t => this.isInWeeklyOverview(t)).length;
                        } else if (list.id === 'memos') {
                            count = this.db.memos.length;
                        } else if (list.id === 'my-day') {
                            count = this.db.tasks.filter(t => !t.completed && this.isInMyDay(t)).length;
                        } else {
                            count = this.db.tasks.filter(t => !t.completed && t.listId === list.id).length;
                        }

                        div.className = `nav-item ${isActive ? 'active' : ''} ${!isSystem ? 'draggable' : ''}`;
                        div.dataset.id = list.id;
                        div.dataset.type = list.type;
                        if (!isSystem) div.setAttribute('draggable', 'true');

                        let svgPath = '';
                        if(list.id === 'my-day') svgPath = '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.24.84l1.79-1.79 1.41 1.41-1.79 1.79-1.41-1.41zM17.24 18.16l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41zM20 13h3v-2h-3v2zm-9 9h2v-3h-2v3zm-7.24-3.16l-1.79 1.79 1.41 1.41 1.79-1.79-1.41-1.41zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>';
                        else if(list.id === 'important') svgPath = '<path d="M22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.7 4.03 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>';
                        else if(list.id === 'weekly-overview') svgPath = '<path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v13c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 15H5V10h14v9zm-2.7-7.7l-5 5a1 1 0 01-1.42 0l-2-2 1.42-1.42 1.29 1.29 4.29-4.29 1.42 1.42z"/>';
                        else if(list.id === 'memos') svgPath = '<path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5M8 12h8v-1.5H8V12zm0 4h8v-1.5H8V16zm0 4h5v-1.5H8V20z"/>';
                        else if(list.id === 'tasks') svgPath = '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>';
                        else svgPath = '<path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>';

                        const iconClass = (list.id === 'my-day' || list.id === 'tasks' || list.id === 'important' || list.id === 'weekly-overview' || list.id === 'memos') ? (isActive ? 'icon-blue' : 'icon-gray') : 'icon-gray';
                        const actionsHtml = !isSystem 
                            ? `<div class="nav-actions">
                                 <button class="btn-icon-hover edit-list" title="重命名">
                                   <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                 </button>
                                 <button class="btn-icon-hover delete" title="删除列表">
                                   <svg viewBox="0 0 24 24" style="width:14px;height:14px"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                 </button>
                               </div>` 
                            : '<div class="nav-actions"></div>';

                        div.innerHTML = `
                            <svg class="${iconClass}" viewBox="0 0 24 24">${svgPath}</svg>
                            <span class="nav-text">${this.escapeHtml(list.title)}</span>
                            ${actionsHtml}
                            ${count > 0 ? `<span class="nav-count">${count}</span>` : '<span class="nav-count"></span>'}
                        `;
                        frag.appendChild(div);
                    });
                    this.dom.navList.innerHTML = '';
                    this.dom.navList.appendChild(frag);
                },

                renderHeader() {
                    if (this.state.sidebarSearchKeyword) {
                        this.dom.viewTitle.textContent = this.isMemoView() ? '搜索备忘录' : '搜索结果';
                        this.dom.dateDisplay.textContent = '';
                        this.dom.progressStats.textContent = '';
                        return;
                    }
                    const list = this.db.lists.find(l => l.id === this.state.currentListId) || this.db.lists[0];
                    this.dom.viewTitle.textContent = list.title;
                    if (list.id === 'my-day') {
                        this.dom.dateDisplay.textContent = new Date().toLocaleDateString('zh-CN', {
                            month: 'long',
                            day: 'numeric',
                            weekday: 'long'
                        });
                    } else if (list.id === 'weekly-overview') {
                        this.dom.dateDisplay.textContent = this.formatCurrentWeekRangeText();
                    } else if (list.id === 'memos') {
                        this.dom.dateDisplay.textContent = `${this.db.memos.length} 条备忘录`;
                    } else {
                        this.dom.dateDisplay.textContent = '';
                    }
                    this.dom.progressStats.textContent = '';
                },

                updateInputSelect() {
                    const select = this.dom.inpList;
                    select.innerHTML = '';
                    this.db.lists.forEach(list => {
                        if (list.id === 'important' || list.id === 'weekly-overview' || list.id === 'memos') return;
                        const option = document.createElement('option');
                        option.value = list.id;
                        option.textContent = list.title;
                        select.appendChild(option);
                    });
                    if (this.state.currentListId === 'important' || this.state.currentListId === 'weekly-overview' || this.state.currentListId === 'memos') select.value = 'my-day';
                    else select.value = this.state.currentListId;
                },

                syncFilterControls() {
                    this.dom.sidebarSearchInput.value = this.state.sidebarSearchKeyword;
                    this.dom.sortMode.value = this.state.sortMode;
                },

                getAddedAt(task) {
                    return task.addedAt || task.created || task.id || Date.now();
                },

                getYearMonth(timestamp) {
                    const d = new Date(timestamp);
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    return `${d.getFullYear()}-${month}`;
                },

                formatDateWithWeekday(timestamp) {
                    const d = new Date(timestamp);
                    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
                    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekdays[d.getDay()]}`;
                },

                formatDueDateShort(timestamp, withTime = false) {
                    const d = new Date(timestamp);
                    const year = String(d.getFullYear()).slice(-2);
                    const month = d.getMonth() + 1;
                    const day = d.getDate();
                    const base = `${year}/${month}/${day}`;
                    if (!withTime) return base;
                    const hh = String(d.getHours()).padStart(2, '0');
                    const mm = String(d.getMinutes()).padStart(2, '0');
                    return `${base} ${hh}:${mm}`;
                },

                highlightText(text, keyword) {
                    const safe = this.escapeHtml(text || '');
                    if (!keyword) return safe;
                    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    if (!escapedKeyword) return safe;
                    const re = new RegExp(`(${escapedKeyword})`, 'ig');
                    return safe.replace(re, '<mark class="kw-highlight">$1</mark>');
                },

                isSameDay(a, b) {
                    return a.getFullYear() === b.getFullYear()
                        && a.getMonth() === b.getMonth()
                        && a.getDate() === b.getDate();
                },

                isDueToday(task) {
                    if (!task.dueDate) return false;
                    return this.isSameDay(new Date(task.dueDate), new Date());
                },

                syncDueTodayTasksToMyDay() {
                    let changed = false;
                    this.db.tasks.forEach(task => {
                        if (task.completed) return;
                        if (this.isDueToday(task) && !task.inMyDay) {
                            task.inMyDay = true;
                            task.autoInMyDay = true;
                            changed = true;
                        }
                    });
                    if (changed) this.save();
                },

                getCurrentWeekRange(baseTime = Date.now()) {
                    const base = new Date(baseTime);
                    const day = base.getDay();
                    const mondayOffset = day === 0 ? -6 : 1 - day;
                    const start = new Date(base);
                    start.setHours(0, 0, 0, 0);
                    start.setDate(base.getDate() + mondayOffset);
                    const end = new Date(start);
                    end.setDate(start.getDate() + 6);
                    end.setHours(23, 59, 59, 999);
                    return { start: start.getTime(), end: end.getTime() };
                },

                isCompletedInCurrentWeek(task) {
                    if (!task.completed || !task.completedAt) return false;
                    const range = this.getCurrentWeekRange();
                    return task.completedAt >= range.start && task.completedAt <= range.end;
                },

                isUncompletedDueInCurrentWeek(task) {
                    if (task.completed || !task.dueDate) return false;
                    const range = this.getCurrentWeekRange();
                    return task.dueDate >= range.start && task.dueDate <= range.end;
                },

                isInWeeklyOverview(task) {
                    return this.isCompletedInCurrentWeek(task) || this.isUncompletedDueInCurrentWeek(task);
                },

                formatDateYmd(timestamp) {
                    const d = new Date(timestamp);
                    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
                },

                formatCurrentWeekRangeText() {
                    const range = this.getCurrentWeekRange();
                    return `${this.formatDateYmd(range.start)}～${this.formatDateYmd(range.end)}`;
                },

                getTasksForCurrentList() {
                    if (this.state.sidebarSearchKeyword) return [...this.db.tasks];
                    if (this.state.currentListId === 'tasks') return [...this.db.tasks];
                    if (this.state.currentListId === 'important') return this.db.tasks.filter(t => t.important);
                    if (this.state.currentListId === 'weekly-overview') {
                        return this.db.tasks.filter(t => this.isInWeeklyOverview(t));
                    }
                    if (this.state.currentListId === 'my-day') {
                        return this.db.tasks.filter(t => this.isInMyDay(t));
                    }
                    return this.db.tasks.filter(t => t.listId === this.state.currentListId);
                },

                taskMatchesKeyword(task, keyword) {
                    if (!keyword) return true;
                    const text = (task.text || '').toLowerCase();
                    const note = (task.note || '').toLowerCase();
                    const stepText = Array.isArray(task.steps) ? task.steps.map(s => (s.text || '').toLowerCase()).join(' ') : '';
                    return text.includes(keyword) || note.includes(keyword) || stepText.includes(keyword);
                },

                applyNonCompletionFilters(tasks) {
                    let output = [...tasks];
                    if (this.state.sidebarSearchKeyword) {
                        output = output.filter(t => this.taskMatchesKeyword(t, this.state.sidebarSearchKeyword));
                    }
                    return output;
                },

                applyTaskFilters(tasks) {
                    let output = this.applyNonCompletionFilters(tasks);
                    if (!this.state.showCompleted) output = output.filter(t => !t.completed);
                    return output;
                },

                updateProgressStats() {
                    this.dom.progressStats.textContent = '';
                },

                sortTasks(tasks) {
                    return tasks.sort((a, b) => {
                        if (a.completed !== b.completed) return a.completed ? 1 : -1;

                        if (a.completed && b.completed) {
                            const aDone = a.completedAt || 0;
                            const bDone = b.completedAt || 0;
                            if (aDone !== bDone) return bDone - aDone;
                            const aAdded = this.getAddedAt(a);
                            const bAdded = this.getAddedAt(b);
                            return bAdded - aAdded;
                        }

                        const sortMode = this.state.sortMode;
                        const aAdded = this.getAddedAt(a);
                        const bAdded = this.getAddedAt(b);

                        if (sortMode === 'default') {
                            if (a.important !== b.important) return a.important ? -1 : 1;
                            const aDue = a.dueDate || Number.MAX_SAFE_INTEGER;
                            const bDue = b.dueDate || Number.MAX_SAFE_INTEGER;
                            if (aDue !== bDue) return aDue - bDue;
                            return bAdded - aAdded;
                        }

                        if (sortMode === 'added_desc') return bAdded - aAdded;
                        if (sortMode === 'added_asc') return aAdded - bAdded;

                        const aDue = a.dueDate || Number.MAX_SAFE_INTEGER;
                        const bDue = b.dueDate || Number.MAX_SAFE_INTEGER;
                        if (sortMode === 'due_desc') {
                            const aDueDesc = a.dueDate || Number.MIN_SAFE_INTEGER;
                            const bDueDesc = b.dueDate || Number.MIN_SAFE_INTEGER;
                            if (aDueDesc !== bDueDesc) return bDueDesc - aDueDesc;
                            return bAdded - aAdded;
                        }
                        if (aDue !== bDue) return aDue - bDue;
                        return bAdded - aAdded;
                    });
                },

                renderTasks() {
                    const listEl = this.dom.taskList;
                    listEl.innerHTML = '';
                    const newlyAddedIdSet = new Set(this.state.newlyAddedTaskIds || []);
                    const clickedTaskId = this.state.clickedTaskId;
                    const shouldPulseOnListSwitch = this.state.listSwitchedPulse;
                    const frag = document.createDocumentFragment();
                    const now = Date.now();
                    const activeKeyword = this.state.sidebarSearchKeyword;

                    let tasks = this.getTasksForCurrentList();
                    tasks = this.applyTaskFilters(tasks);
                    tasks = this.sortTasks(tasks);
                    this.updateProgressStats();
                    let completedDividerInserted = false;

                    tasks.forEach(task => {
                        if (task.completed && !completedDividerInserted) {
                            const divider = document.createElement('li');
                            divider.className = 'completed-divider-item';
                            divider.innerHTML = '<span class="completed-divider-pill">已完成</span>';
                            frag.appendChild(divider);
                            completedDividerInserted = true;
                        }
                        const li = document.createElement('li');
                        
                        // Meta Tags Building
                        let metaHtml = '';
                        let hasDueMeta = false;
                        
                        if (task.recurrence && task.recurrence !== 'none') {
                            const icon = '<svg style="width:12px;height:12px" viewBox="0 0 24 24"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>';
                            let label = '';
                            if(task.recurrence === 'daily') label = '每天';
                            if(task.recurrence === 'weekly') label = '每周';
                            if(task.recurrence === 'monthly') label = '每月';
                            if(task.recurrence === 'quarterly') label = '每季';
                            metaHtml += `<span class="meta-tag" title="循环任务">${icon} ${label}</span>`;
                        }

                        if (task.dueDate) {
                            let dueText = '';
                            let colorClass = '';
                            if (task.completed) {
                                const completedRef = task.completedAt || now;
                                const wasOverdueAtCompletion = this.isOverdueAt(task, completedRef);
                                if (wasOverdueAtCompletion) {
                                    dueText = `超期 (${this.formatDueDateShort(task.dueDate, !!task.hasTime)})`;
                                    colorClass = 'text-danger';
                                } else {
                                    dueText = this.formatDueDateShort(task.dueDate, !!task.hasTime);
                                }
                            } else {
                                const dueObj = this.getRelativeTime(task.dueDate, task.hasTime, now);
                                dueText = dueObj.text;
                                const isOverdue = task.dueDate < now;
                                colorClass = isOverdue ? 'text-danger' : '';
                            }
                            const clockIcon = `<svg class="${colorClass}" style="width:12px;height:12px" viewBox="0 0 24 24"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>`;
                            metaHtml += `<span class="meta-tag ${colorClass}">${clockIcon} ${dueText}</span>`;
                            hasDueMeta = true;
                        }

                        let listLabel = '';
                        if (this.state.sidebarSearchKeyword) {
                            const list = this.db.lists.find(l => l.id === task.listId);
                            if (list && list.id !== 'tasks' && list.id !== 'my-day') listLabel = list.title;
                        } else if ((this.state.currentListId === 'tasks' || this.state.currentListId === 'my-day' || this.state.currentListId === 'important' || this.state.currentListId === 'weekly-overview') && task.listId !== 'my-day' && task.listId !== 'tasks') {
                            const list = this.db.lists.find(l => l.id === task.listId);
                            if (list) listLabel = list.title;
                        }

                        const steps = Array.isArray(task.steps) ? task.steps : [];
                        let stepProgress = '';
                        if (steps.length > 0) {
                            const doneSteps = steps.filter(step => step.completed).length;
                            stepProgress = `${doneSteps}/${steps.length}`;
                        }
                        if (stepProgress) {
                            const stepMeta = hasDueMeta ? `· ${stepProgress}` : stepProgress;
                            metaHtml += `<span class="meta-list-steps">${this.escapeHtml(stepMeta)}</span>`;
                        }
                        if (listLabel) {
                            metaHtml += `<span class="text-list-name">${this.escapeHtml(listLabel)}</span>`;
                        }

                        const hasMeta = metaHtml !== '';
                        const stepsHtml = steps.map(step => `
                            <li class="step-item ${step.completed ? 'done' : ''}">
                                <button class="step-checkbox" data-step-id="${step.id}" title="完成步骤"></button>
                                <span class="step-text">${this.highlightText(step.text, activeKeyword)}</span>
                                <button class="step-delete" data-step-id="${step.id}" title="删除步骤">×</button>
                            </li>
                        `).join('');
                        const isToggledByCard = this.state.expandedTaskIds.includes(task.id);
                        const baseShowDetail = this.state.sidebarSearchKeyword ? true : this.state.showDetails;
                        const shouldShowDetail = baseShowDetail ? !isToggledByCard : isToggledByCard;
                        li.className = `task-item ${task.completed ? 'completed' : ''} ${shouldShowDetail ? 'show-detail' : ''} ${hasMeta ? '' : 'no-meta'} ${newlyAddedIdSet.has(task.id) ? 'task-item-new' : ''} ${clickedTaskId === task.id ? 'task-item-clicked' : ''} ${shouldPulseOnListSwitch ? 'task-item-list-switch' : ''}`;
                        li.dataset.id = task.id;

                        const completedInfoText = task.completedAt ? `完成于${this.formatDateWithWeekday(task.completedAt)}` : '';
                        const createdInfoText = `创建于${this.formatDateWithWeekday(this.getAddedAt(task))}`;
                        const dateInfoHtml = completedInfoText
                            ? `<span class="task-completed-at">${completedInfoText}</span><span class="task-date-sep"> · </span><span class="task-created-at">${createdInfoText}</span>`
                            : `<span class="task-created-at">${createdInfoText}</span>`;
                        li.innerHTML = `
                            <div class="task-header">
                                <div class="custom-checkbox">
                                    <svg class="check-icon" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                                </div>
                                <div class="task-content">
                                    <span class="task-text">${this.highlightText(task.text, activeKeyword)}</span>
                                    ${hasMeta ? `<div class="task-meta">${metaHtml}</div>` : ''}
                                </div>
                                <div class="actions-group">
                                    <button class="btn-action edit" title="编辑任务">
                                        <svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                    </button>
                                    <button class="btn-action delete" title="删除任务">
                                        <svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
                                    </button>
                                    <button class="btn-action btn-action-myday ${this.isInMyDay(task) ? 'active' : ''}" title="${this.isInMyDay(task) ? '从我的一天移除' : '添加到我的一天'}">
                                        <svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM1 13h3v-2H1v2zm10-9h2V1h-2v3zm7.24.84l1.79-1.79 1.41 1.41-1.79 1.79-1.41-1.41zM17.24 18.16l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41zM20 13h3v-2h-3v2zm-9 9h2v-3h-2v3zm-7.24-3.16l-1.79 1.79 1.41 1.41 1.79-1.79-1.41-1.41zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/></svg>
                                    </button>
                                    <button class="btn-action btn-action-important ${task.important ? 'active' : ''}" title="${task.important ? '取消重要' : '标记重要'}">
                                        <svg viewBox="0 0 24 24" style="width:16px;height:16px"><path d="${task.important ? 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' : 'M22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.7 4.03 4.38.38-3.32 2.88 1 4.28L12 15.4z'}"/></svg>
                                    </button>
                                </div>
                            </div>
                            ${steps.length > 0 ? `<div class="task-steps-view"><ul class="step-list">${stepsHtml}</ul></div>` : ''}
                            ${task.note ? `<div class="task-note-view">${this.highlightText(task.note, activeKeyword)}</div>` : ''}
                            <div class="task-extra-dates ${completedInfoText ? '' : 'only-created'}">
                                ${dateInfoHtml}
                            </div>
                        `;
                        frag.appendChild(li);
                    });
                    listEl.appendChild(frag);
                    if (newlyAddedIdSet.size > 0) this.state.newlyAddedTaskIds = [];
                    if (clickedTaskId !== null) this.state.clickedTaskId = null;
                    if (shouldPulseOnListSwitch) this.state.listSwitchedPulse = false;
                },

                renderMemos() {
                    const memos = this.getFilteredMemos();

                    this.dom.memoList.innerHTML = '';
                    if (memos.length === 0) {
                        const empty = document.createElement('div');
                        empty.className = 'memo-empty-list';
                        empty.textContent = this.state.sidebarSearchKeyword
                            ? '没有找到匹配的备忘录，试试换个关键词。'
                            : '还没有备忘录，点击右上角“新建”写一条。';
                        this.dom.memoList.appendChild(empty);
                    } else {
                        const frag = document.createDocumentFragment();
                        memos.forEach((memo) => {
                            const item = document.createElement('li');
                            item.className = 'memo-list-item';
                            item.dataset.id = memo.id;
                            item.innerHTML = `
                                <button type="button" class="memo-card-button">
                                    <div class="memo-card-body">
                                        <div class="memo-card-title-row">
                                            <span class="memo-card-dot"></span>
                                            <p class="memo-list-title">${this.highlightText(this.getMemoTitle(memo), this.state.sidebarSearchKeyword)}</p>
                                        </div>
                                        <p class="memo-list-preview">${this.highlightText(this.getMemoPreview(memo), this.state.sidebarSearchKeyword)}</p>
                                        <span class="memo-list-date">更新于 ${this.formatMemoTimestamp(memo.updatedAt || memo.createdAt || memo.id)}</span>
                                    </div>
                                </button>
                            `;
                            frag.appendChild(item);
                        });
                        this.dom.memoList.appendChild(frag);
                    }
                },

                getRelativeTime(timestamp, hasTime, referenceTime = Date.now()) {
                    const diff = timestamp - referenceTime;
                    const d = new Date(timestamp);
                    const datePart = this.formatDueDateShort(timestamp, false);
                    const timePart = `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`;
                    const dateStr = hasTime ? `${datePart} ${timePart}` : datePart;

                    const today = new Date(referenceTime);
                    const tomorrow = new Date(today.getTime() + 86400000);
                    const isToday = this.isSameDay(d, today);
                    const isTomorrow = this.isSameDay(d, tomorrow);

                    if (diff < 0 && !isToday) return { text: `超期 (${dateStr})` };
                    if (isToday) return { text: `今天${hasTime ? ' ' + timePart : ''}` };
                    if (isTomorrow) return { text: `明天${hasTime ? ' ' + timePart : ''}` };
                    
                    const oneDay = 3600000 * 24;
                    const days = Math.ceil(diff/oneDay);
                    return { text: `${days > 0 ? days : 0}天后 (${dateStr})` };
                },

                isOverdueAt(task, referenceTime) {
                    if (!task || !task.dueDate) return false;
                    if (task.hasTime) return task.dueDate < referenceTime;
                    const due = new Date(task.dueDate);
                    const ref = new Date(referenceTime);
                    return !this.isSameDay(due, ref) && task.dueDate < referenceTime;
                },

                normalizeTasks() {
                    this.db.tasks.forEach(t => {
                        if (t.recurrence === undefined) t.recurrence = 'none';
                        if (t.note === undefined) t.note = '';
                        if (t.hasTime === undefined) t.hasTime = false;
                        if (t.recurrenceAnchorDay === undefined) {
                            t.recurrenceAnchorDay = t.dueDate ? new Date(t.dueDate).getDate() : null;
                        }
                        if (t.created === undefined) t.created = t.id || Date.now();
                        if (t.addedAt === undefined) t.addedAt = t.created;
                        if (t.important === undefined) t.important = false;
                        if (t.inMyDay === undefined) t.inMyDay = t.listId === 'my-day';
                        if (t.autoInMyDay === undefined) t.autoInMyDay = false;
                        if (t.completedAt === undefined) t.completedAt = t.completed ? t.created : null;
                        if (!Array.isArray(t.steps)) t.steps = [];
                    });
                },

                normalizeMemos() {
                    if (!Array.isArray(this.db.memos)) this.db.memos = [];
                    this.db.memos = this.db.memos.map((memo) => {
                        const createdAt = memo.createdAt || memo.updatedAt || memo.id || Date.now();
                        const updatedAt = memo.updatedAt || createdAt;
                        return {
                            id: memo.id || createdAt,
                            title: memo.title || '',
                            content: memo.content || '',
                            createdAt,
                            updatedAt
                        };
                    });
                },

                ensureSystemLists() {
                    const required = [
                        { id: 'my-day', title: '我的一天', icon: 'sun', type: 'system' },
                        { id: 'important', title: '重要', icon: 'star', type: 'system' },
                        { id: 'weekly-overview', title: '本周速览', icon: 'week', type: 'system' },
                        { id: 'tasks', title: '全部任务', icon: 'home', type: 'system' },
                        { id: 'memos', title: '备忘录', icon: 'memo', type: 'system' }
                    ];
                    const customLists = this.db.lists.filter(l => l.type !== 'system');
                    const systemLists = required.map(sys => {
                        const exists = this.db.lists.find(l => l.id === sys.id);
                        return exists ? { ...exists, ...sys } : sys;
                    });
                    this.db.lists = [...systemLists, ...customLists];
                },

                openDb() {
                    if (this._idbPromise) return this._idbPromise;
                    this._idbPromise = new Promise((resolve, reject) => {
                        if (!window.indexedDB) {
                            reject(new Error('IndexedDB not supported'));
                            return;
                        }
                        const req = indexedDB.open(this.state.idbName, 1);
                        req.onupgradeneeded = () => {
                            const db = req.result;
                            if (!db.objectStoreNames.contains(this.state.idbStore)) {
                                db.createObjectStore(this.state.idbStore);
                            }
                        };
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(req.error);
                    });
                    return this._idbPromise;
                },

                readFromIndexedDb() {
                    return this.openDb().then((db) => new Promise((resolve, reject) => {
                        const tx = db.transaction(this.state.idbStore, 'readonly');
                        const store = tx.objectStore(this.state.idbStore);
                        const req = store.get(this.state.idbDataKey);
                        req.onsuccess = () => resolve(req.result || null);
                        req.onerror = () => reject(req.error);
                    }));
                },

                writeToIndexedDb(data) {
                    return this.openDb().then((db) => new Promise((resolve, reject) => {
                        const tx = db.transaction(this.state.idbStore, 'readwrite');
                        const store = tx.objectStore(this.state.idbStore);
                        store.put(data, this.state.idbDataKey);
                        tx.oncomplete = () => resolve();
                        tx.onerror = () => reject(tx.error);
                        tx.onabort = () => reject(tx.error || new Error('indexeddb write aborted'));
                    }));
                },

                async loadData() {
                    let data = null;
                    try {
                        data = await this.readFromIndexedDb();
                    } catch (err) {}

                    if (!data) {
                        const legacy = localStorage.getItem(this.state.storageKey);
                        if (legacy) {
                            try {
                                const legacyData = JSON.parse(legacy);
                                if (legacyData && legacyData.lists && legacyData.tasks) {
                                    data = legacyData;
                                    try {
                                        await this.writeToIndexedDb(legacyData);
                                    } catch (err) {}
                                }
                            } catch (err) {}
                        }
                    }

                    if (data && data.lists && data.tasks) this.db = data;
                    this.ensureSystemLists();
                    this.normalizeTasks();
                    this.normalizeMemos();
                },

                save() {
                    this.writeToIndexedDb(this.db).catch(() => {
                        // Fallback keeps data from being lost if IndexedDB is unavailable.
                        localStorage.setItem(this.state.storageKey, JSON.stringify(this.db));
                    });
                },
                escapeCsvCell(value) {
                    const str = value == null ? '' : String(value);
                    return `"${str.replace(/"/g, '""')}"`;
                },
                taskToCsvRow(task) {
                    const list = this.db.lists.find(l => l.id === task.listId);
                    const steps = Array.isArray(task.steps)
                        ? task.steps
                            .map((s, i) => `${i + 1}、${s.text || ''}`)
                            .join('\n')
                        : '';
                    const createdAt = this.formatDateWithWeekday(this.getAddedAt(task));
                    const completedAt = task.completedAt ? this.formatDateWithWeekday(task.completedAt) : '';
                    const dueAt = task.dueDate ? this.formatDueDateShort(task.dueDate, !!task.hasTime) : '';
                    const row = [
                        task.text || '',
                        steps,
                        task.note || '',
                        list ? list.title : (task.listId || ''),
                        dueAt,
                        createdAt,
                        completedAt
                    ];
                    return row.map(v => this.escapeCsvCell(v)).join(',');
                },
                downloadCsv(filename, lines) {
                    const bom = '\uFEFF';
                    const csv = bom + lines.join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = filename;
                    a.click();
                    URL.revokeObjectURL(url);
                },
                archiveDataToCsv() {
                    const yearInput = prompt('请输入要归档任务的完成年份（四位数字，例如2025）');
                    if (!yearInput) return;
                    const year = parseInt(yearInput, 10);
                    if (!year || year < 1970 || year > 9999) {
                        alert('年份格式不正确。请输入四位数字年份，例如 2025。');
                        return;
                    }
                    const selectedTasks = this.db.tasks.filter(t => {
                        if (!t.completed || !t.completedAt) return false;
                        return new Date(t.completedAt).getFullYear() === year;
                    });

                    if (!selectedTasks.length) {
                        alert(`未找到完成时间在 ${year} 年的任务。`);
                        return;
                    }

                    const header = [
                        '标题', '步骤', '备注', '所属清单', '截止日期', '创建时间', '完成时间'
                    ].map(v => this.escapeCsvCell(v)).join(',');
                    const rows = selectedTasks.map(t => this.taskToCsvRow(t));
                    const datePart = new Date().toISOString().slice(0, 10);
                    this.downloadCsv(`todo_archive_${datePart}.csv`, [header, ...rows]);

                    if (confirm(`已导出 ${selectedTasks.length} 条 ${year} 年完成的任务到 CSV。\n是否将这些任务从当前列表中移除（仅保留在归档文件中）？`)) {
                        const idSet = new Set(selectedTasks.map(t => t.id));
                        this.db.tasks = this.db.tasks.filter(t => !idSet.has(t.id));
                        this.state.expandedTaskIds = this.state.expandedTaskIds.filter(id => !idSet.has(id));
                        this.save();
                        this.renderAll();
                    }
                },
                escapeHtml(text) { if(!text) return ''; const div = document.createElement('div'); div.textContent = text; return div.innerHTML; },
                exportData() {
                    const blob = new Blob([JSON.stringify(this.db, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = `todo_backup_${new Date().toISOString().slice(0,10)}.json`; a.click();
                },
                importData(input) {
                    const file = input.files[0]; if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        try {
                            const data = JSON.parse(e.target.result);
                            if (data.lists && data.tasks) {
                                this.db = data;
                                this.ensureSystemLists();
                                this.normalizeTasks();
                                this.normalizeMemos();
                                this.save();
                                this.renderAll();
                                alert('导入成功');
                            }
                        } catch(err) { alert('文件错误'); }
                    }; reader.readAsText(file); input.value = '';
                },
                startTimer() {
                    let lastDateKey = this.formatDateYmd(Date.now());
                    setInterval(() => {
                        const currentDateKey = this.formatDateYmd(Date.now());
                        if (currentDateKey !== lastDateKey) {
                            lastDateKey = currentDateKey;
                            this.renderAll();
                        }
                    }, 60000);
                }
            };
            app.init();
        });
