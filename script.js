
const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasks');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

let notifiedReminders = JSON.parse(localStorage.getItem('notifiedReminders')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function saveNotifiedReminders() {
    localStorage.setItem('notifiedReminders', JSON.stringify(notifiedReminders));
}

function createTaskElement(task, index) {
    const li = document.createElement('li');
    li.className = 'task-item';

    const title = document.createElement('h3');
    title.textContent = task.title;
    li.appendChild(title);

    if (task.description) {
        const desc = document.createElement('p');
        desc.textContent = task.description;
        li.appendChild(desc);
    }

    const meta = document.createElement('p');
    meta.className = 'task-meta';
    meta.textContent = `Due: ${task.dueDate}` + (task.reminder ? ` | Reminder: ${task.reminder}` : '');
    li.appendChild(meta);

    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'task-buttons';

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => {
        const taskId = getTaskId(task);
        tasks.splice(index, 1);
        saveTasks();

        const notifiedIndex = notifiedReminders.indexOf(taskId);
        if (notifiedIndex !== -1) {
            notifiedReminders.splice(notifiedIndex, 1);
            saveNotifiedReminders();
        }

        renderTasks();
    };
    buttonsContainer.appendChild(deleteBtn);

    const remindAgainBtn = document.createElement('button');
    remindAgainBtn.textContent = 'Remind Again';
    remindAgainBtn.onclick = () => {
        let snoozeMinutes = prompt('Enter snooze duration in minutes:', '5');
        if (snoozeMinutes !== null) {
            snoozeMinutes = parseInt(snoozeMinutes);
            if (!isNaN(snoozeMinutes) && snoozeMinutes > 0) {
                const [hours, minutes] = task.reminder.split(':').map(Number);
                const reminderDate = new Date();
                reminderDate.setHours(hours);
                reminderDate.setMinutes(minutes + snoozeMinutes);
                reminderDate.setSeconds(0);
                reminderDate.setMilliseconds(0);

                const newHours = reminderDate.getHours().toString().padStart(2, '0');
                const newMinutes = reminderDate.getMinutes().toString().padStart(2, '0');
                const newReminder = `${newHours}:${newMinutes}`;

                task.reminder = newReminder;
                saveTasks();
                renderTasks();

                const taskId = getTaskId(task);
                const notifiedIndex = notifiedReminders.indexOf(taskId);
                if (notifiedIndex !== -1) {
                    notifiedReminders.splice(notifiedIndex, 1);
                    saveNotifiedReminders();
                }
            } else {
                alert('Invalid snooze duration.');
            }
        }
    };
    buttonsContainer.appendChild(remindAgainBtn);

    li.appendChild(buttonsContainer);

    const crossBtn = document.createElement('button');
    crossBtn.textContent = '×';
    crossBtn.title = 'Delete Task';
    crossBtn.className = 'cross-btn';
    crossBtn.onclick = () => {
        const taskId = getTaskId(task);
        tasks.splice(index, 1);
        saveTasks();

        const notifiedIndex = notifiedReminders.indexOf(taskId);
        if (notifiedIndex !== -1) {
            notifiedReminders.splice(notifiedIndex, 1);
            saveNotifiedReminders();
        }

        renderTasks();
    };
    li.appendChild(crossBtn);

    return li;
}

function getTaskId(task) {
    return task.id;
}

function renderTasks() {
    tasksList.innerHTML = '';
    tasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        tasksList.appendChild(taskElement);
    });
}

function playReminderSound(task) {
    const reminderSound = document.getElementById('reminderSound');
    reminderSound.play().catch(e => {
        console.log('Audio play prevented:', e);
        setTimeout(() => {
            reminderSound.play().catch(e => console.log('Audio play failed:', e));
        }, 1000);
    });
}

function checkReminders() {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0,5); // HH:MM format

    tasks.forEach(task => {
        if (task.reminder && task.dueDate === currentDate) {
            const taskId = getTaskId(task);
            if (task.reminder === currentTime && !notifiedReminders.includes(taskId)) {
                playReminderSound(task);
                notifiedReminders.push(taskId);
                saveNotifiedReminders();
            }
        }
    });
}

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const newTask = {
        id: Date.now().toString(),
        title: taskForm.taskTitle.value.trim(),
        description: taskForm.taskDescription.value.trim(),
        dueDate: taskForm.taskDueDate.value,
        reminder: taskForm.taskReminder.value
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();

    taskForm.reset();
});

renderTasks();

setInterval(checkReminders, 10000);
