(function (root, factory) {
    const api = factory();
    if (typeof module === 'object' && module.exports) module.exports = api;
    if (root) root.TodoRecurrence = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    function addMonthsClamped(date, months, anchorDay = date.getDate()) {
        const result = new Date(date);
        result.setDate(1);
        result.setMonth(result.getMonth() + months);
        const lastDayOfTargetMonth = new Date(
            result.getFullYear(),
            result.getMonth() + 1,
            0
        ).getDate();
        result.setDate(Math.min(anchorDay, lastDayOfTargetMonth));
        return result;
    }

    function getNextDueDate(date, recurrence, anchorDay = date.getDate()) {
        const result = new Date(date);
        if (Number.isNaN(result.getTime())) return null;

        switch (recurrence) {
            case 'daily':
                result.setDate(result.getDate() + 1);
                return result;
            case 'weekly':
                result.setDate(result.getDate() + 7);
                return result;
            case 'monthly':
                return addMonthsClamped(result, 1, anchorDay);
            case 'quarterly':
                return addMonthsClamped(result, 3, anchorDay);
            default:
                return null;
        }
    }

    return { addMonthsClamped, getNextDueDate };
}));
