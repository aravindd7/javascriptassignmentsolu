
window.onload = async function () {
    console.log("Loaded");
    const dbName = 'TasksAutoIncDB';
    const isExisting = (await window.indexedDB.databases()).map(db => db.name).includes(dbName);
    let modalSubTask = document.getElementById("modalSub");
    let modalEditTask = document.getElementById("modalEdit");
    modalSubTask.style.display = "none";
    modalEditTask.style.display = "none";

    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
    if (!window.indexedDB) {
        console.log("Your browser doesn't support a stable version of IndexedDB. Such and such feature will not be available.");
    }

    //------------------Classes-----------------

    class Task {
        name;
        category;
        id;
        due;
        containerid;
        checked;
        children;

        constructor(name, category, id, due, containerid, checked, children) {
            this.name = name;
            this.category = category;
            this.id = id;
            this.due = due;
            this.containerid = containerid;
            this.checked = checked;
            this.children = children;
        }
    }



    const DB = new Promise((resolve, reject) => {

        const request = window.indexedDB.open('TasksAutoIncDB', 1);

        request.onupgradeneeded = function (event) {
            request.result.createObjectStore("tasklist", { keypath: 'id' });
            request.result.createObjectStore("taskcontainerslist", { autoIncrement: true });
            request.result.createObjectStore("subtaskslist", { keypath: 'id3' });
        }

        request.onsuccess = () => resolve(request.result);

        request.onerror = e => reject(e);
    })


    let tasksMain = [];
    let filterroot = false;

    //-------------------functions-----------------------
    //function to retrieve tasks from database
    const renderTasks = (tasksfiltered, filter) => {



        DB.then(db => {
            const request = db.transaction('tasklist', 'readwrite').objectStore('tasklist').getAll();
            const request2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').getAll();

            //-----------clear database data---**dont delete**

            // const clearRequest = db.transaction('tasklist', 'readwrite').objectStore('tasklist').clear();
            // clearRequest.onsuccess = e => {
            // }

            // const clearRequest2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').clear();
            // clearRequest2.onsuccess = e => {
            //     console.log("data cleared");
            // }

            //----------------------------------------------------------------[fix asynchronous]

            request2.onsuccess = e => {
                containerMain = e.target.result;
                console.log('containerMain: ', containerMain);

                const listTodo = document.getElementById('list__todo');
                listTodo.innerHTML = "";
                let containersHolder;
                if (filter === false) {
                    containersHolder = containerMain[0].containers;
                    console.log('containersHolder: ', containersHolder, "false filter called");

                }
                else {
                    containersHolder = tasksfiltered;
                    console.log('containersHolder: ', containersHolder, "true filter called");
                }
                console.log('containersHolder: ', containersHolder);
                containersHolder.forEach((container) => {

                    //    console.log('container: ', container);
                    //    console.log('containerid2: ', container.id2);
                    //    console.log('containerid2.name: ', container.task.name);
                    let child1;
                    let child2;
                    let child3;
                    let containerChildren = container.task.children;
                    if (containerChildren[0]) {
                        child1 = containerChildren[0];
                    }
                    else {
                        child1 = '';
                    }
                    if (containerChildren[1]) {
                        child2 = containerChildren[1];
                    }
                    else {
                        child2 = '';
                    }
                    if (containerChildren[2]) {
                        child3 = containerChildren[2];
                    }
                    else {
                        child3 = '';
                    }
                    //console.log('containerChildren: ', containerChildren);
                    const taskEl = document.createElement('li');
                    taskEl.className = 'height--onethird';
                    taskEl.innerHTML = `
                                 <div id=${container.id2} class="dropzone border--solid overflow">
                                 <div data-id=${container.task.id} id=${container.task.id} draggable="true" class="container__todo">
                                 <div class="container--row">
                                 <span>${container.task.name}<span>
                                 <span style="margin-left: 1vw;">Due: ${container.task.due}</span>
                                 <span style="margin-left: 1vw;">category: ${container.task.category}</span>
                                 </div>
                                 <p>${child1}</p>
                                 <p>${child2}</p>
                                 <p>${child3}</p>
                                 </div>
                                 </div>
                            `;

                    // Buttons Container

                    const ulBtns = document.createElement('ul');
                    ulBtns.className = 'container--row';
                    ulBtns.innerHTML = '<li></li>';

                    const addSub = document.createElement('li');
                    addSub.className = 'btn--sub';
                    addSub.innerHTML = '<span class="border--solid" style="margin-left: 1vw;">Add Sub Task<i style="margin-left: 1vw;" class="bi bi-plus"></i></span>';

                    addSub.addEventListener('click', (event) => {

                        if (filter) {
                            alert("sorry you are in filtered mode, click reset to enable");
                        }
                        else {
                            modalSubTask.style.display = "block";
                            modalSubTask.style.position = "fixed";
                            modalSubTask.style.top = "10vh";
                            modalSubTask.style.left = "40vw";
                            modalSubTask.style.background = "rgb(0, 0, 0)";
                            console.log('subId: ', container.id2);

                            let add = document.getElementById('btn__addSubTask--modal');
                            add.addEventListener('click', () => {
                                console.log("inner event");
                                let containerChildren = container.task.children;
                                let subinput = document.getElementById('subtask--name').value;
                                //console.log('subinput: ', subinput);
                                containerChildren.push(subinput);
                                //console.log('containerChildren: ', containerChildren);
                                container.task.children = containerChildren;
                                const subrequest = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').put({ containers: containersHolder }, 0);
                                subrequest.onsuccess = e => {
                                    console.log("put", subinput, "in", container.task.name);
                                }

                                renderTasks('', false);

                            });
                        }

                    });


                    const editBtn = document.createElement('li');
                    editBtn.className = 'btn';
                    editBtn.innerHTML = '<span class="border--solid" style="margin-left: 1vw;">Edit Task<i  style="margin-left: 1vw;" class="bi bi-pencil-square"></i></span>';

                    editBtn.addEventListener('click', (event) => {
                        if (filter) {
                            alert("sorry you are in filtered mode, click reset to enable");
                        }
                        else {
                            modalEditTask.style.display = "block";
                            modalEditTask.style.position = "fixed";
                            modalEditTask.style.top = "10vh";
                            modalEditTask.style.left = "40vw";
                            modalEditTask.style.background = "rgb(10, 10, 0)";
                            console.log('subId: ', container.id2);
                            let edit = document.getElementById('btn--EditModal');
                            edit.addEventListener('click', () => {
                                console.log("inner event");
                                let editname = document.getElementById("edittask--name").value;
                                let editcategory = document.getElementById("task__edit--category");
                                let editcategoryText = editcategory.options[editcategory.selectedIndex].text;
                                let editdue = document.getElementById("task__edit--due").value;

                                container.task.name = editname;
                                container.task.category = editcategoryText;
                                container.task.due = editdue;
                                const editrequest = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').put({ containers: containersHolder }, 0);
                                editrequest.onsuccess = e => {
                                    console.log("edited", container.task.name);
                                }

                                renderTasks('', false);

                            });
                        }

                    });

                    const delBtn = document.createElement('li');
                    delBtn.className = 'btn';
                    delBtn.innerHTML = '<span class="border--solid" style="margin-left: 1vw;">Delete Task<i  style="margin-left: 1vw;" class="bi bi-trash"></i></span>';

                    delBtn.addEventListener('click', (event) => {
                        if (filter) {

                            alert("sorry you are in filtered mode, click reset to enable");
                        }
                        else {
                            console.log("inner event");

                            let tempContainers = containersHolder;
                            let atIndex = tempContainers.findIndex(el => el.id == container.id);
                            tempContainers.splice(atIndex, 1);
                            containersHolder = tempContainers;
                            const delrequest = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').put({ containers: containersHolder }, 0);
                            delrequest.onsuccess = e => {
                                console.log("deleted");
                            }

                            renderTasks('', false);
                        }

                    });

                    const markBtn = document.createElement('li');
                    markBtn.className = 'btn__checked';
                    if (container.task.checked) {
                        markBtn.innerHTML = '<i  style="margin-left: 1vw;" class="bi bi-check2-circle"></i>';
                    }
                    else {
                        markBtn.innerHTML = '<i style="margin-left: 1vw;" class="bi bi-circle"></i>';
                    }
                    markBtn.addEventListener('click', (event) => {
                        if (filter) {

                            alert("sorry you are in filtered mode, click reset to enable");
                        }
                        else {
                            let tempChecked = container.task.checked;
                            if (tempChecked === true) {
                                tempChecked = false;
                                container.task.checked = tempChecked;
                            }
                            else {
                                tempChecked = true;
                                container.task.checked = tempChecked;
                            }
                            const checkrequest = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').put({ containers: containersHolder }, 0);
                            checkrequest.onsuccess = e => {
                                console.log("checked");
                            }

                            renderTasks('', false);
                            console.log('subId: ', container.id2);
                        }

                    });

                    ulBtns.append(addSub);
                    ulBtns.append(editBtn);
                    ulBtns.append(delBtn);
                    ulBtns.append(markBtn);

                    const listTodo = document.getElementById('list__todo');
                    // console.log("listTodo","taskEl",listTodo,taskEl);
                    listTodo.appendChild(taskEl);
                    listTodo.appendChild(ulBtns);
                });
            };

        });
    };

    //--------------retrieve database on subsequent reloads

    if (isExisting) {
        renderTasks('', false);
    }

    //----------------------------

    //function to add tasks to database
    const addTasks = () => {
        let name = document.getElementById("task--name").value;
        let category = document.getElementById("task--category");
        let categoryText = category.options[category.selectedIndex].text;
        let due = document.getElementById("task--due").value;
        let id = Math.random();
        let id2 = Math.random();
        let ind = 0;
        const fal = false;
        const emp = [];
        let autoInc;
        DB.then(db => {
            //{Database Structure {containers: Containers}}
            const request = db.transaction('tasklist', 'readwrite').objectStore('tasklist').getAll();
            request.onsuccess = e => {
                let taskTemp = new Task(`${name}`, `${categoryText}`, `${id}`, `${due}`, `${id2}`);
                const store = db.transaction('tasklist', 'readwrite').objectStore('tasklist');
                store.add(taskTemp, id);
                //console.log("task added");
            }

            const request2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').getAll();
            request2.onsuccess = e => {
                const store2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist');
                let taskTemp = new Task(`${name}`, `${categoryText}`, `${id}`, `${due}`, `${id2}`, false, []);
                let rootTemp = request2.result;
                // console.log('rootTemp: ', rootTemp);
                if (rootTemp.length === 0) {
                    // containerTemp.push({id2: taskTemp});
                    let containerTemp = { id2: id2, task: taskTemp };
                    // console.log('containerTemp: ', containerTemp);
                    let tempContainers = [];
                    tempContainers.push(containerTemp);
                    //console.log('tempContainers: initial', tempContainers);
                    store2.add({ containers: tempContainers }, 0);
                }
                else {
                    let containerTemp = { id2: id2, task: taskTemp };
                    let tempContainers = rootTemp[0].containers;
                    // console.log('tempContainers: ', tempContainers);
                    tempContainers.push(containerTemp);
                    // console.log('tempContainers: later ', tempContainers);
                    store2.put({ containers: tempContainers }, 0);
                    //console.log("container added");
                }
            };

        });
    };





    //---------------Event-Listeners-------------------------

    const search = document.getElementById('btnsearch');
    const sort = document.getElementById('sortby');
    const filter = document.getElementById('filterby');
    const searchby = document.getElementById('searchby');
    const reset = document.getElementById('reset');


    searchTasks = () => {
        DB.then(db => {
            const request2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').getAll();
            request2.onsuccess = e => {
                let tempContainerMain = request2.result;
                let tempContainerHolder = tempContainerMain[0].containers;


                console.log("search request");
                const searchinput = document.getElementById('search--task').value;
                console.log('searchinput: ', searchinput);

                function filterBySearch(item, index) {
                    let namevar = item.task.name;
                    console.log('namevar: ', namevar);
                    let bool = namevar.includes(searchinput);
                    if (bool) {
                        return true
                    }
                    return false;
                }

                let searchTrimmed = tempContainerHolder.filter(filterBySearch);
                console.log('searchTrimmed: ', searchTrimmed);

                renderTasks(searchTrimmed, true);
            };
        });
    };

    resetTasks = () => {
        console.log("reset requested");
        renderTasks('', false);
        filterroot = false;
    };

    filterTasks = () => {
        console.log("filter requested");
        DB.then(db => {
            const request2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').getAll();
            request2.onsuccess = e => {
                let tempContainerMain = request2.result;
                let tempContainerHolder = tempContainerMain[0].containers;
                const filterinput = document.getElementById('filterby');
                console.log('filterinput: ', filterinput);
                let index = filterinput.selectedIndex;
                console.log('index: ', index);
                let filterTrimmed;
                let length = tempContainerHolder.length;
                if (index === 1) {
                    let trim = length - 3;
                    filterTrimmed = tempContainerHolder.splice(3, trim);
                    console.log('filterTrimmed: ', filterTrimmed);
                    renderTasks(filterTrimmed, true);
                }
                else {
                    resetTasks();
                }
                // 
                
            };

        });
    };

    sortTasks = () => {
        console.log("sort requested");
        DB.then(db => {
            const request2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').getAll();
            request2.onsuccess = e => {

                let tempContainerMain = request2.result;
                let tempContainerHolder = tempContainerMain[0].containers;
                console.log('tempContainerHolder: before date sort ', tempContainerHolder);
                let priority = document.getElementById("sortby");
                let priorityText = priority.options[priority.selectedIndex].text;
                if (priorityText === 'Date') {
                    console.log("sort by date requested");
                    function compare(a, b) {
                        if (a.task.due < b.task.due) {
                            return -1;
                        }
                        if (a.task.due > b.task.due) {
                            return 1;
                        }
                        return 0;
                    }

                    let sorttedTasksByDate = tempContainerHolder.sort(compare);
                    console.log('sorttedTasksByDate: ', sorttedTasksByDate);
                    renderTasks(sorttedTasksByDate, true);
                }
                else {
                    resetTasks();
                }
            };

        });
    };

    searchByTasks = () => {
        console.log("sort requested");
        DB.then(db => {
            const request2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').getAll();
            request2.onsuccess = e => {
                let tempContainerMain = request2.result;
                let tempContainerHolder = tempContainerMain[0].containers;
                let category = document.getElementById("task--category");
                let categoryText = category.options[category.selectedIndex].text;

                function filterBySearch(item, index) {
                    let namevar = item.task.category;
                    console.log('namevar: ', namevar);
                    if (namevar === categoryText) {
                        return true
                    }
                    return false;
                }

                let searchTrimmed = tempContainerHolder.filter(filterBySearch);
                console.log('searchTrimmed: ', searchTrimmed);
                renderTasks(searchTrimmed, true);
            };

        });
    };


    search.addEventListener('click', searchTasks);
    sort.addEventListener('change', sortTasks);
    filter.addEventListener('change', filterTasks);
    searchby.addEventListener('change', searchByTasks);
    reset.addEventListener('click', resetTasks);

    // debugger;   
    //----------------Drag-Drop Script------------------------
    var dragged;

    /* events fired on the draggable target */
    document.addEventListener("drag", function (event) {

    }, false);

    document.addEventListener("dragstart", function (event) {
        dragged = event.target;
        // console.log("dragstartid", event.target.id);
        event.dataTransfer.setData("text/plain", event.target.id);
        event.target.style.opacity = .5;
    }, false);

    document.addEventListener("dragend", function (event) {
        // reset the transparency
        // console.log("dragend", event.target.id);
        event.target.style.opacity = "";
    }, false);

    /* events fired on the drop targets */
    document.addEventListener("dragover", function (event) {
        // prevent default to allow drop
        event.preventDefault();
    }, false);

    document.addEventListener("dragenter", function (event) {
        // highlight potential drop target when the draggable element enters it
        if (event.target.className == "dropzone") {
            // console.log("dragenter", event.target.id2);
            event.target.style.background = "purple";
        }

    }, false);

    document.addEventListener("dragleave", function (event) {
        // reset background of potential drop target when the draggable element leaves it
        if (event.target.className == "dropzone") {
            event.target.style.background = "";
            // console.log("dragleave", event.target.id);
        }

    }, false);

    document.addEventListener("drop", function (event) {
        event.preventDefault();
        if (filterroot) {
            alert("sorry you are in filtered mode, click reset to enable");
        }
        else {
            if (event.target.classList.contains("dropzone") || event.target.parentNode.classList.contains("dropzone")) {

                let data = event.dataTransfer.getData("text");
                console.log();
                let dropId = event.target.id;
                let taskPriority = event.target.id;
                console.log("task-target--dropped container", taskPriority, "task--dragged", data);

                DB.then(db => {
                    let taskToUpdate;
                    const request = db.transaction('tasklist', 'readwrite').objectStore('tasklist').getAll();
                    const request2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').get(taskPriority);
                    const request3 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist').getAll();


                    //-------------------------Request3------------------

                    request3.onsuccess = e => {
                        let rootTemp = request3.result;
                        let tempContainers = rootTemp[0].containers;
                        let taskUpdate = tempContainers.find(function (task, index) {
                            if (task.id2 == taskPriority)
                                return true;
                        });

                        let toIndex = tempContainers.findIndex(task => task.id2 == taskPriority);
                        console.log("container to append to", "existing", taskUpdate.task.name, taskUpdate);

                        let taskToInsert = tempContainers.find(function (task, index) {
                            if (task.task.id == data)
                                return true;
                        });
                        console.log('taskToInsert: ', taskToInsert.task.name, taskToInsert);

                        let fromIndex = tempContainers.findIndex(task => task.task.id == data);
                        console.log("fromIndex", fromIndex, "toIndex", toIndex);
                        if (fromIndex > -1 && toIndex > -1) {
                            let spliced = tempContainers.splice(fromIndex, 1);
                            console.log('spliced: ', spliced);
                            let insert = tempContainers.splice(toIndex, 0, spliced[0]);
                            console.log('insert: ', insert, "tempContainers after insert", tempContainers);
                            const store2 = db.transaction('taskcontainerslist', 'readwrite').objectStore('taskcontainerslist');
                            store2.put({ containers: tempContainers }, 0);
                            renderTasks('', false);
                        }
                    };

                });
            }
        }
    }, false);



    //----------------------Modal Script---------------------- 
    var modal = document.getElementById("myModal");

    var btn = document.getElementById("btn__addTask");

    var btnModal = document.getElementById("btn__addTask--modal");

    var btncloseModal = document.getElementById("btn--closeModal");


    btn.onclick = function () {
        modal.style.display = "block";
    }


    btnModal.onclick = function () {
        modal.style.display = "none";
    }

    btnModal.addEventListener('click', () => {
        renderTasks('', false);
        addTasks();
    });

    btncloseModal.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    //-----------sub tasks modal

    var btnSubModal = document.getElementById("btn__addSubTask--modal");

    var btncloseSubModal = document.getElementById("btn--closeSubModal");


    btnSubModal.onclick = function () {
        modalSubTask.style.display = "none";
    }

    btnSubModal.addEventListener('click', () => {
        renderTasks('', false);
        addTasks();
    });

    btncloseSubModal.onclick = function () {
        modalSubTask.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modalSubTask.style.display = "none";
        }
    }

    //--------Edit Modal


    var btnEditModal = document.getElementById("btn--EditModal");

    var btncloseEditModal = document.getElementById("btn--closeEditModal");

    btnEditModal.onclick = function () {
        modalEditTask.style.display = "none";
    }

    btnEditModal.addEventListener('click', () => {
        renderTasks('', false);
        addTasks();
    });

    btncloseEditModal.onclick = function () {
        modalEditTask.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modalEditTask.style.display = "none";
        }
    }

};




