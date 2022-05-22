module.exports = [
    {
        id : "action_fetch_data",
        message: "Make an HTTP request to a specified URL",
        severity : "high",
    },
    {
        id : "action_run_mysql_query",
        message : "Connect to a database and run a query",
        severity : "high"
    },
    {
        id : "action_escaped_query",
        message : "Connect to a database and run an escaped query",
        severity : "high"
    },
    {
        id : "action_send_email",
        message : "Send an email based on parameters",
        severity : "high"
    },
    {
        id: "action_basic_command",
        message : "Run a terminal command",
        severity : "high"
    },
    {
        id: "action_post_data",
        message : "Posts data to a specified url",
        severity : "high"
    },
    {
        id: "action_ftp_upload",
        message : "Uploads a file to FTP server",
        severity : "high"
    },
    {
        id: "action_sftp_upload",
        message : "Uploads a file to FTP server",
        severity : "high"
    },
    {
        id: "action_while",
        message : "Uses while loop. (While loops can crash your application)",
        severity : "high"
    },
    {
        id: "action_include_file",
        message : "Uses include file. Runs flow from another file",
        severity : "high"
    },
    {
        id: "action_file_function",
        message : "Uses include file. Runs flow from another file",
        severity : "high"
    },
    {
        id: "action_read_files_as_string",
        message : "Read a specified file",
        severity : "medium"
    },
    {
        id: "action_write_to_file",
        message :  "Write to a file",
        severity : "medium"
    },
    {
        id: "action_read_files_to_array",
        message :  "Reads all files in a directory",
        severity : "medium"
    },
    {
        id: "action_read_files_as_string",
        message :  "Reads file contents",
        severity : "medium"
    },
    {
        id: "action_read_file",
        message :  "Read a specified file",
        severity : "low"
    },
    {
        id: "action_wait_time",
        message :  "Uses wait",
        severity : "low"
    },
    {
        id: "action_read_excel_as_array",
        message :  "Read a specified excel file",
        severity : "low"
    },
    {
        id: "action_save_to_excel",
        message :  "Saves a file to excel",
        severity : "low"
    },
    {
        id: "action_file_move",
        message :  "Moves a file from one location to another",
        severity : "low"
    },
    {
        id: "action_open_a_file",
        message :  "Open a selected file on your computer",
        severity : "low"
    },
    {
        id: "action_stop_execution",
        message :  "Uses and execution break. Flow stops prematurely.",
        severity : "low"
    }


]