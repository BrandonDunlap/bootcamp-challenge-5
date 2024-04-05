$(document).ready(function () {
    let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
    let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

    function generateTaskId() {
        return nextId++;
    }

    function getTaskColor(dueDate) {
        const today = dayjs().format('YYYY-MM-DD');
        const tomorrow = dayjs().add(1, 'day').format('YYYY-MM-DD');
        if (dueDate < today) return 'bg-danger';  // Red for past due
        if (dueDate === today) return 'bg-warning'; // Orange for today
        return 'bg-light';  // White for future
    }

    function createTaskCard(task) {
        const taskColor = getTaskColor(task.dueDate);
        const card = $(`<div class="task-card card ${taskColor} mb-3"></div>`);
        card.append(`<div class="card-header">${task.title}<button class="btn btn-sm btn-danger float-end delete-task">Delete</button></div>`);
        card.append(`<div class="card-body">${task.description}</div>`);
        card.append(`<div class="card-footer">Due: ${task.dueDate}</div>`);
        card.data('taskId', task.id);
        return card;
    }

    function renderTaskList() {
        $('#todo-cards, #in-progress-cards, #done-cards').empty();
        taskList.forEach(task => {
            const card = createTaskCard(task);
            $(`#${task.status}-cards`).append(card);
        });
        $(".task-card").draggable({
            containment: ".container",
            revert: "invalid",
            stack: ".task-card"
        });

        // Bind delete button events
        $('.delete-task').click(function() {
            const taskId = $(this).closest('.task-card').data('taskId');
            taskList = taskList.filter(task => task.id !== taskId);
            localStorage.setItem("tasks", JSON.stringify(taskList));
            renderTaskList();
        });
    }

    $("#saveTask").click(function(event) {
        event.preventDefault();
        const task = {
            id: generateTaskId(),
            title: $("#taskTitle").val(),
            description: $("#taskDescription").val(),
            dueDate: $("#taskDueDate").val(),
            status: "to-do"
        };

        taskList.push(task);
        localStorage.setItem("tasks", JSON.stringify(taskList));
        localStorage.setItem("nextId", JSON.stringify(nextId));
        $("#taskForm")[0].reset();
        $('#formModal').modal('hide');
        renderTaskList();
    });

    $(".lane").droppable({
        drop: function(event, ui) {
            const newStatus = $(this).attr('id');
            const taskId = ui.draggable.data('taskId');
            const task = taskList.find(t => t.id === taskId);
            task.status = newStatus;
            if (newStatus === "done") {
                ui.draggable.removeClass("bg-danger bg-warning").addClass("bg-light");
            }
            localStorage.setItem("tasks", JSON.stringify(taskList));
            renderTaskList();
        }
    });

    $("#taskDueDate").datepicker();
    renderTaskList();
});
