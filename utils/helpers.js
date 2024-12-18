// filter task according to filter_by
function filter(task, filter_by, week_start, week_end) {
    if (!task.due_date) {
        return true;
    }

    // for all task
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

// get current week start and end dates, which is needed in filter
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

// to check if user id creator of a task
function isOwner(owner_email, task_email) {
    return owner_email === task_email;
}

// extracting zod error messages
function getZodError(err) {
    const issues = err.issues;
    if (issues.length > 0) {
        return { error: issues[0].message };
    }
    return { error: "Something went wrong, please refresh" };
}

// reverse array helper to change order of tasks
function reverseArray(arr) {
    const rev = [];
    for (let i = arr.length - 1; i >= 0; i--) {
        rev.push(arr[i]);
    }
    return rev;
}

export { isOwner, reverseArray, filter, getWeekDates, getZodError };
