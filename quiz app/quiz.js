const question = [
  {
    question: "What is the largest animal in the world?",
    answer: [
      {text:"Shark",correct: false},
      {text:"blue whell",correct: true},
      {text:"Elephant",correct: false},
      {text:"Giraffe",correct: false},
    ]
  },
  {
    
    question: "What is the capital of France?",
    answer: [
      {text:"Berlin",correct: false},
      {text:"Madrid",correct: false},
      {text:"Paris",correct: true},
      {text:"Rome",correct: false},
    ] 
  },
  {
    question: "What is the largest planet in our solar system?",
    answer: [
      {text:"Earth",correct: false},
      {text:"Jupiter",correct: true},
      {text:"Saturn",correct: false},
      {text:"Mars",correct: false},
    ]
  },
  {
    question: "What is the chemical symbol for gold?",  
    answer: [
      {text:"Au",correct: true},
      {text:"Ag",correct: false},
      {text:"Fe",correct: false},
      {text:"Cu",correct: false},
    ]
  },{
    question: "What is the largest ocean on Earth?",
    answer: [
      {text:"Atlantic Ocean",correct: false},
      {text:"Indian Ocean",correct: false},
      {text:"Arctic Ocean",correct: false},
      {text:"Pacific Ocean",correct: true},
    ]
  }
]

const questionElement = document.getElementById("question");
const answerButtons = document.getElementById("answer-button");
const nextButton = document.getElementById("next-btn");

let currentQuestionIndex = 0;
let score = 0;

function startQuiz(){
  currentQuestionIndex = 0;
  score = 0;
  nextButton.innerHTML = "Next";
  showQuestion();
}

function showQuestion(){
  resetState();
  let currentQuestion = question[currentQuestionIndex];
  let questionNo = currentQuestionIndex + 1;
  questionElement.innerHTML = questionNo + ". " + currentQuestion.question;

  currentQuestion.answer.forEach(answer => {
    const button = document.createElement("button");
    button.innerHTML = answer.text;
    button.classList.add("btn");
    answerButtons.appendChild(button);
  });
}

function resetState(){
  nextButton.style.display = "none";

  while(answerButtons.firstChild){
    answerButtons.removeChild(answerButtons.firstChild);
  }
}
startQuiz();
