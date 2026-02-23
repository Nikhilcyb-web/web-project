const todoList = [];
function AddTodo () {
  const inputElement = document.querySelector('.js-placeholder-name')
  const name = inputElement.value;
 
  todoList.push(name);
  console.log(todoList)
}