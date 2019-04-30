
function getSeverityClass(severity) {
    switch (severity) {
        case "Low": return "info";
        case "Medium": return "warning";
        case "High": return "danger";
    }
}

export default {
    getSeverityClass,
};
