// DOM Elements
const textInput = document.getElementById('text-input');
const refreshButton = document.getElementById('refresh-btn');
const timerDisplay = document.getElementById('timer');
const textPreview = document.querySelector('#text-preview p');
const wpmDisplay = document.querySelector('#wpm-preview #display h1');
const accuracyDisplay = document.createElement('h2'); // New element for accuracy
wpmDisplay.parentNode.appendChild(accuracyDisplay);

// Game State
let timeLeft = 60;
let timerInterval = null;
let currentWordIndex = 0;
let words = [];
let hasStarted = false;
let wordHistory = [];
let correctWords = 0;
let incorrectWords = 0;
let totalCharactersTyped = 0; // Total characters typed for WPM calculation

// Indonesian Word Bank
const kataKata = [
  'saya', 'kamu', 'dia', 'kami', 'mereka',
  'makan', 'minum', 'tidur', 'belajar', 'bermain',
  'menulis', 'membaca', 'berlari', 'berjalan', 'berenang',
  'buku', 'pensil', 'kertas', 'meja', 'kursi',
  'rumah', 'sekolah', 'taman', 'pantai', 'gunung',
  'mobil', 'sepeda', 'motor', 'pesawat', 'kereta',
  'nasi', 'roti', 'buah', 'sayur', 'ikan',
  'kucing', 'anjing', 'burung', 'ikan', 'ayam',
  'besar', 'kecil', 'tinggi', 'rendah', 'cepat',
  'lambat', 'bagus', 'jelek', 'pintar', 'rajin'
];

// Timer Functions
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function startTimer() {
  if (timerInterval || hasStarted) return;
  
  hasStarted = true;
  timerInterval = setInterval(() => {
    timeLeft--;
    timerDisplay.style.color = timeLeft <= 10 ? 'red' : '';
    timerDisplay.textContent = formatTime(timeLeft);

    if (timeLeft === 0) {
      endGame();
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = 60;
  hasStarted = false;
  timerDisplay.style.color = '';
  timerDisplay.textContent = '01:00';
}

// Text Generation Functions
function generateRandomSentence() {
  const sentenceLength = Math.floor(Math.random() * 10) + 10;
  return Array.from({ length: sentenceLength }, () => 
    kataKata[Math.floor(Math.random() * kataKata.length)]
  ).join(' ');
}

function updateTextDisplay() {
  const newText = generateRandomSentence();
  words = newText.split(' ');
  wordHistory = [];
  highlightCurrentWord();
}

// Word Highlighting and Checking
function highlightCurrentWord() {
  const displayWords = words.map((word, index) => {
    if (index === currentWordIndex) {
      return `<span style="background-color: gray; color: white;">${word}</span>`;
    } else if (index < currentWordIndex) {
      const status = wordHistory[index];
      return `<span style="color: ${status ? 'green' : 'red'}">${word}</span>`;
    }
    return word;
  });
  textPreview.innerHTML = displayWords.join(' ');
}

// Fungsi baru untuk memeriksa pengetikan secara real-time tanpa mengubah teks asli
function checkCurrentTyping(typedText, correctWord) {
  let typingStatus = '';
  
  for (let i = 0; i < typedText.length; i++) {
    if (i >= correctWord.length || typedText[i] !== correctWord[i]) {
      return false; // Terdapat kesalahan
    }
  }
  
  return true; // Sejauh ini benar
}

function updateStats() {
  const accuracy = correctWords + incorrectWords > 0 
  ? Math.round((correctWords / (correctWords + incorrectWords)) * 100) 
  : 0;
  accuracyDisplay.textContent = `Akurasi: ${accuracy}% (Benar: ${correctWords}, Salah: ${incorrectWords})`;
}

function checkInput(event) {
  if (!hasStarted && event.target.value.length > 0) {
    startTimer();
  }

  const currentText = event.target.value;
  const currentWord = words[currentWordIndex];
  
  // Cek apakah sedang mengetik kata dengan benar
  const isCurrentlyCorrect = checkCurrentTyping(currentText, currentWord);
  
  // Menampilkan ulang kata-kata dengan kata yang sedang diketik disorot sesuai status
  const displayWords = words.map((word, index) => {
    if (index === currentWordIndex) {
      if (isCurrentlyCorrect) {
        return `<span style="background-color: gray; color: white;">${word}</span>`;
      } else {
        return `<span style="background-color: gray; color: red;">${word}</span>`;
      }
    } else if (index < currentWordIndex) {
      const status = wordHistory[index];
      return `<span style="color: ${status ? 'green' : 'red'}">${word}</span>`;
    }
    return word;
  });
  textPreview.innerHTML = displayWords.join(' ');

  if (currentText.endsWith(' ')) {
    const typedWord = currentText.trim();
    const isCorrect = typedWord === currentWord;
    
    // Update statistics
    if (isCorrect) {
      correctWords++;
    } else {
      incorrectWords++;
    }
    totalCharactersTyped += typedWord.length; // Update total characters typed
    
    // Record result and move to next word
    wordHistory[currentWordIndex] = isCorrect;
    currentWordIndex++;
    textInput.value = '';

    if (currentWordIndex >= words.length) {
      currentWordIndex = 0;
      updateTextDisplay();
    } else {
      highlightCurrentWord();
    }
    
    updateStats(); // Update stats after each word
  }
}

// WPM Calculation
function calculateWPM() {
  const minutes = (60 - timeLeft) / 60;
  const wpm = Math.round((totalCharactersTyped / 5) / minutes);
  return wpm || 0;
}

// Game State Management
function endGame() {
  clearInterval(timerInterval);
  textInput.disabled = true;
  const wpm = calculateWPM();
  wpmDisplay.textContent = `${wpm} WPM`;
  updateStats(); // Show accuracy and word count only after time is up
}

function resetGame() {
  resetTimer();
  currentWordIndex = 0;
  wordHistory = [];
  correctWords = 0;
  incorrectWords = 0;
  totalCharactersTyped = 0;
  textInput.value = '';
  textInput.disabled = false;
  wpmDisplay.textContent = '- WPM';
  accuracyDisplay.textContent = 'Akurasi: 0% (Benar: 0, Salah: 0)';
  updateTextDisplay();
}

// Event Listeners
textInput.addEventListener('input', checkInput);
refreshButton.addEventListener('click', resetGame);

// Initialize
window.addEventListener('load', () => {
  updateTextDisplay();
  accuracyDisplay.textContent = 'Akurasi: 0% (Benar: 0, Salah: 0)';
});