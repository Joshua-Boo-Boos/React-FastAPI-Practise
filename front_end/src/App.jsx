import { useState, useEffect } from 'react'
import './App.css'
import SHA512 from 'crypto-js/sha512'

function App() {
  const [questionLabelText, setQuestionLabelText] = useState('');
  const [num1, setNum1] = useState(null);
  const [num2, setNum2] = useState(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [answer, setAnswer] = useState(null);
  const [inputAnswer, setInputAnswer] = useState(null);
  const [username, setUsername] = useState('');
  const [inputUsername, setInputUsername] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [currentScore, setCurrentScore] = useState(0);
  const [gotQuestion, setGotQuestion] = useState(false);

  const username_salt_for_hashes = 'tu3%Y£$U$^UJ$YRJH$REe4theheth3%U£%UY^$UJ^ETHJUEThje4t6jhe46jhu£$%UET£JE$^TJHe6j43euj34E^TYJU^£$EUJ$ETD^YJU^$£EUJhe46jute6yjuhe436ujhETJ$';
  const password_salt_for_hashes = '&^*%*^%$&$&%&£$%&^£%356tyu64u4r7ik4rryjbreujhn^U%^U%&UI%&u5yujntryrnj$UN$%UN%^&UN%UN$%N$NU46nu4645nn456umn456mu46u4£%$Y£TV"$TV"$TB£&$^M$';

  useEffect(() => {
    // const intervalId = setInterval(() => {
    //   if (loggedIn) {
    //     getCurrentScore();
    //   }
    // }, 500);
    // return () => clearInterval(intervalId);
    if (loggedIn) {
      getCurrentScore();
    }
  }, [loggedIn])

  const getQuestion = () => {
    let newNum1, newNum2;
    if (difficulty === 'easy') {
      newNum1 = Math.round(Math.random() * 10);
      newNum2 = Math.round(Math.random() * 10);
    } else if (difficulty === 'medium') {
      newNum1 = Math.round(Math.random() * (20 - (-5)) + (-5));
      newNum2 = Math.round(Math.random() * (20 - (-5)) + (-5));
    } else if (difficulty === 'hard') {
      newNum1 = Math.round(Math.random() * (40 - (-40)) + (-40));
      newNum2 = Math.round(Math.random() * (40 - (-40)) + (-40));
    }

    while (newNum2 === 0) {
      if (difficulty === 'easy') {
        newNum2 = Math.round(Math.random() * 10);
      } else if (difficulty === 'medium') {
        newNum2 = Math.round(Math.random() * (20 - (-5)) + (-5));
      } else if (difficulty === 'hard') {
        newNum2 = Math.round(Math.random() * (40 - (-40)) + (-40))
      }
    }

    setNum1(newNum1);
    setNum2(newNum2);

    const questionType = Math.floor(Math.random() * 4);
    let operation = '';
    if (questionType === 0) {
      operation = '+';
    } else if (questionType === 1) {
      operation = '-';
    } else if (questionType === 2) {
      operation = '×';
    } else if (questionType === 3) {
      operation = '÷';
    }
    
    setQuestionLabelText(() => `${newNum1} ${operation} ${newNum2}`)

    let newAnswer;
    if (operation !== '×' && operation !== '÷') {
      newAnswer = eval(`${newNum1} ${operation} ${newNum2}`)
      setAnswer(newAnswer);
    } else if (operation === '×') {
      newAnswer = eval(`${newNum1} * ${newNum2}`)
      setAnswer(newAnswer);
    } else if (operation === '÷') {
      newAnswer = Number(eval(`${newNum1} / ${newNum2}`).toPrecision(3))
      setAnswer(newAnswer);
    }
    console.log(newNum1, newNum2, operation, difficulty, inputAnswer, typeof inputAnswer, answer, typeof answer);

    const newGotQuestion = true
    setGotQuestion(newGotQuestion);
  }
  const checkAnswer = () => {
    const newGotQuestion = false;
    setGotQuestion(false);
    if (inputAnswer == answer) {
      alert('Correct answer!');
      const newScoreToSet = currentScore + 1;
      setCurrentScore(newScoreToSet);
      submitNewScore();
    } else if (inputAnswer != answer) {
      alert('Incorrect answer!');
      const newScoreToSet = currentScore - 1;
      setCurrentScore(newScoreToSet);
      submitNewScore();
    }
    const newNum1 = null;
    const newNum2 = null;
    setNum1(newNum1);
    setNum2(newNum2);
    getQuestion();
  }
  const submitLoginDetails = async () => {
    if (username.startsWith("<script>") || password.startsWith("<script>") || username.indexOf("'") !== -1 || password.indexOf("'") !== -1) {
      alert('This is not allowed');
    } else {
      const hashedUsername = SHA512(inputUsername + username_salt_for_hashes).toString();
      const hashedPassword = SHA512(inputPassword + password_salt_for_hashes).toString();
      const newInputUsername = '';
      const newInputPassword = '';
      const loginAPIURL = 'http://127.0.0.1:8000/api/login';
      const response = await fetch(loginAPIURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({'username': hashedUsername, 'password': hashedPassword})
      });
      if (!response.ok) {
        console.error('Error:', response.status, response.statusText);
      } else {
        const result = await response.json();
        if (result.success && result.success === true) {
          setLoggedIn(true);
          setUsername(inputUsername);
          setInputUsername(newInputUsername);
          setInputPassword(newInputPassword);
        }
      }
    }
  }
  const getCurrentScore = async () => {
    if (loggedIn) {
      const currentScoreAPIURL = `http://127.0.0.1:8000/api/currentScore?username=${username}`;
      const response = await fetch(currentScoreAPIURL);
      if (!response.ok) {
        console.error('Error:', response.status, response.statusText);
      } else {
        const result = await response.json();
        if (result.score) {
          setCurrentScore(result.score);
        }
      }
    }
  }
  const submitNewScore = async () => {
    if (loggedIn) {
      const submitScoreAPIURL = `http://127.0.0.1:8000/api/submitScore?username=${username}&newscore=${currentScore}`;
      const response = await fetch(submitScoreAPIURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({newScore: currentScore})
      });
      if (!response.ok) {
        console.error('Error:', response.status, response.statusText);
      } else {
        const result = await response.json();
        if (result.success) {
          console.log('New score accepted!');
        } else {
          console.log('Error submitting new score!');
        }
      }
    }
  }

  return (
    <div className='main-div'>
      <label className="current-score-label">Current Score: {currentScore}</label>
      <div className="login-controls">
        <input onChange={(e) => setInputUsername(e.target.value)} placeholder='Username' type="text" className="username" />
        <input onChange={(e) => setInputPassword(e.target.value)} placeholder='Password' type="text" className="password" />
        <button disabled={loggedIn ? true : false} onClick={() => submitLoginDetails()} className="login-button">Login</button>
        <button disabled={loggedIn ? false : true} onClick={() => setLoggedIn(false)} className="logout-button">Logout</button>
      </div>
      <h1>Maths Challenge!</h1>
      <div className="app-functionality-div">
        <div className="difficulty-and-get-question-elements">
          <label className="difficulty-label">Difficulty:</label>
          <select disabled={loggedIn ? false : true} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} name='difficulty' id='difficulty' className="difficulty-select">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button disabled={loggedIn ? false : true} onClick={() => getQuestion()} className="get-question-button">Get Question!</button>
        </div>
        <div className="labels-div">
          <label className="question-label">What is:</label>
          <label className='question'>{questionLabelText}</label>
          <label className='question-end-label'>?</label>
        </div>
        <div className="answer-elements">
          <input disabled={(loggedIn && gotQuestion) ? false : true} onChange={(e) => setInputAnswer(Number(e.target.value))} type="text" className="provided-answer-input" />
          <button disabled={(loggedIn && gotQuestion) ? false : true} onClick={() => checkAnswer()} className="submit-answer">Submit Answer!</button>
        </div>
      </div>
    </div>
  )
}

export default App
