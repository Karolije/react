import React from "react";

class TasksManager extends React.Component {
  state = {
    task: "",
    tasks: [],
  };

  handleChange = (e) => {
    console.log("handleChange", e.target.value);
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
      .then((taskFromServer) => {
        this.setState((state) => ({
          tasks: [...state.tasks, taskFromServer],
          task: "",
        }));
      });
  };

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <input
            name="task"
            value={this.state.task}
            onChange={this.handleChange}
          />
          <button type="submit">Dodaj zadanie</button>
        </form>
      </div>
    );
  }
}

export default TasksManager;
