;(function () {
    'use strict';

    var Event = new Vue();
    var alert_sound = document.getElementById('alert-sound');

    function copy(obj) {
        return Object.assign({}, obj);
    }

    Vue.component('task', {
        template: '#task-tpl',
        props: ['todo'],
        methods: {
            action: function (name, params) {
                Event.$emit(name, params);
            }
        }
    });
    new Vue({
        el: '#main',
        data: {
            list: [],
            last_id:0,
            current: {},
            isEdit:false,

        },
        mounted: function () {
            var me = this;
            this.list = myStorage.get('list') || this.list;
            this.last_id = myStorage.get('last_id') || this.last_id;
            setInterval(function () {
                me.check_alerts();
            },1000);

            Event.$on('remove', function (id) {
                if (id) {
                    me.remove(id);
                }
            });
            Event.$on('toggle_complete', function (id) {
                if (id) {
                    me.toggle_complete(id);
                }
            });
            Event.$on('toggle_detail', function (id) {
                if (id) {
                    me.toggle_detail(id);
                }
            });
            Event.$on('set_current', function (todo) {
                if (todo) {
                    me.set_current(todo);
                }
            });
        },
        methods: {
            toggle_edit:function(){
                this.isEdit = !this.isEdit;
            },
            check_alerts:function(){
                var me = this;
                this.list.forEach(function (row,index) {
                    var alert_at = row.alert_at;
                    if(!alert_at || row.alert_confirmed) return;

                    var alert_at = (new Date(alert_at)).getTime();
                    var now = (new Date()).getTime();

                    if(now >= alert_at){
                        alert_sound.play();
                        var confirmed = confirm(row.title);
                        Vue.set(me.list[index],'alert_confirmed',confirmed);
                    }
                })
            },
            merge: function () {
                var id = this.current.id;
                if (id) {
                    var index = this.find_index(id);
                    Vue.set(this.list, index, copy(this.current));
                } else {
                    var title = this.current.title;
                    if (!title && title !== 0) return;
                    var todo = copy(this.current);
                    this.last_id++;
                    myStorage.set('last_id',this.last_id);
                    todo.id = this.last_id;
                    this.list.push(todo);
                }
                this.reset_current();
            },
            toggle_detail:function(id){
                var index =this.find_index(id);
                Vue.set(this.list[index],'show_detail',!this.list[index].show_detail);
            },
            remove: function (id) {
                var index = this.find_index(id);
                this.list.splice(index, 1);
            },
            next_id: function () {
                return this.list.length + 1;
            },
            set_current: function (todo) {
                this.isEdit = !this.isEdit;
                this.current = copy(todo);
            },
            reset_current: function () {
                this.current = {};
                this.isEdit =false;
            },
            find_index: function (id) {
                return this.list.findIndex(function (item) {
                    return item.id == id;
                })
            },
            toggle_complete: function (id) {
                var index = this.find_index(id);
                Vue.set(this.list[index], 'completed', !this.list[index].completed);
            }
        },
        watch: {
            list: {
                deep: true,
                handler: function (new_val, old_val) {
                    if (new_val) {
                        myStorage.set('list', new_val);
                    } else {
                        myStorage.set('list', [])
                    }
                }
            }
        }
    });
})();