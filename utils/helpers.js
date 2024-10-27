function filter(task, filter_by, week_start, week_end) {
    if (!task.due_date) {
        return true;
    }

    if (filter_by === "All") {
        return true;
    }

    const task_date = new Date(task.due_date);
    const curr_date = new Date();

    switch (filter_by) {
        case "This Month":
            if (
                task_date.getUTCMonth() === curr_date.getUTCMonth() &&
                task_date.getUTCFullYear() === curr_date.getUTCFullYear()
            ) {
                return true;
            }
            break;
        case "This Week":
            if (task_date <= week_end && task_date >= week_start) return true;
            break;
        case "Today":
            if (
                task_date.getUTCDate() === curr_date.getUTCDate() &&
                task_date.getUTCMonth() === curr_date.getUTCMonth() &&
                task_date.getUTCFullYear() === curr_date.getUTCFullYear()
            ) {
                return true;
            }
            break;
        default:
            break;
    }
    return false;
}

function getWeekDates() {
    let week_start = new Date();
    let week_end = new Date();

    week_start.setHours(0, 0, 0, 0);
    week_end.setHours(23, 59, 59, 0);

    // get week start and end dates
    // weeks start at monday and end at sunday
    while (week_start.getDay() !== 1) {
        const temp = week_start.getTime() - 1000 * 60 * 60 * 24;
        week_start = new Date(temp);
    }

    while (week_end.getDay() !== 0) {
        const temp = week_end.getTime() + 1000 * 60 * 60 * 24;
        week_end = new Date(temp);
    }
    return { week_start, week_end };
}

function isOwner(owner_email, task_email) {
    return owner_email === task_email;
}

function reverseArray(arr) {
    const rev = [];
    for (let i = arr.length - 1; i >= 0; i--) {
        rev.push(arr[i]);
    }
    return rev;
}

export { isOwner, reverseArray, filter, getWeekDates };
