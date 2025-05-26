import React from "react";

class TasksManager extends React.Component {
  state = {
    task: "",
    tasks: [],
  };

  interval = null;

  componentWillUnmount() {
    clearInterval(this.interval);
  }
  handleChange = (e) => {
    this.setState({ task: e.target.value });
  };

  componentDidMount() {
    fetch("http://localhost:3005/data")
      .then((res) => res.json())
      .then((data) => this.setState({ tasks: data }));
  }

  handleSubmit = (e) => {
    e.preventDefault();
    console.log("handleSubmit", this.state.task);

    const newTask = {
      name: this.state.task,
      time: 0,
      isRunning: false,
      isDone: false,
      isRemoved: false,
    };

    fetch("http://localhost:3005/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    })
      .then((res) => res.json())
      .then((newTask) => {
        this.setState((state) => ({
          tasks: [...state.tasks, newTask],
          task: "",
        }));
      });
  };
  incrementTime(id) {
    this.setState((state) => {
      const newTasks = state.tasks.map((task) => {
        if (task.id === id) {
          return { ...task, time: task.time + 1 };
        }

        return task;
      });

      return {
        tasks: newTasks,
      };
    });
  }

  updateTask = (id, newTask) => {
    const task = this.state.tasks.find((t) => t.id === id);
    const updatedTask = { ...task, ...newTask };

    fetch(`http://localhost:3005/data/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    })
      .then((res) => res.json())
      .then((newTask) => {
        this.setState((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? newTask : t)),
        }));
      });
  };
  startCounting = (id) => {
    const task = this.state.tasks.find((t) => t.id === id);

    if (task.isRunning) {
      clearInterval(this.interval);
      this.interval = null;
      this.updateTask(id, { isRunning: false });
    } else {
      this.interval = setInterval(() => this.incrementTime(id), 1000);
      this.updateTask(id, { isRunning: true });
    }
  };

  taskDone = (id) => {
    clearInterval(this.interval);
    this.updateTask(id, { isDone: true, isRunning: false });
  };

  removeTask = (id) => {
    this.updateTask(id, { isRemoved: true });
  };
  formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };
  render() {
    return (
      <div className="container">
        <h1 className="title">Task manager</h1>
        <form onSubmit={this.handleSubmit} className="formContainer">
          <input
            name="task"
            value={this.state.task}
            onChange={this.handleChange}
          />
          <button type="submit">Dodaj zadanie</button>
        </form>
        <div className="taskList">
          {this.state.tasks
            .filter((task) => !task.isRemoved)
            .map((task) => (
              <div
                className={`taskItem ${
                  task.isDone ? "taskDone" : task.isRunning ? "taskRunning" : ""
                }`}
              >
                <p className="taskName">
                  {task.name}, {this.formatTime(task.time)}
                </p>
                <div className="taskButtons">
                  {" "}
                  <button
                    onClick={() => this.startCounting(task.id)}
                    disabled={
                      task.isDone ||
                      (!task.isRunning &&
                        this.state.tasks.some(
                          (t) => t.isRunning && t.id !== task.id
                        ))
                    }
                  >
                    {task.isRunning ? "Stop" : "Start"}
                  </button>
                  <button
                    disabled={task.isDone}
                    onClick={() => this.taskDone(task.id)}
                  >
                    Zadanie zakończone
                  </button>
                  <button
                    onClick={() => this.removeTask(task.id)}
                    disabled={!task.isDone}
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }
}

export default TasksManager;
