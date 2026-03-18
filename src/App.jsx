import React, { useState } from 'react';

function App() {
  const [view, setView] = useState('upload'); // 'upload', 'feed'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [apiKey, setApiKey] = useState(localStorage.getItem('openai_key') || '');

  // Demo sample questions for instant demo
  const demoQuestions = [
    {
      id: 1,
      question: "React Hooksの中で、コンポーネントの状態を管理するために使用されるHookは何ですか？",
      answer: "useState",
      topic: "React基礎",
      author: "AI先生"
    },
    {
      id: 2,
      question: "CSSフレームワークで、ユーティリティファーストのアプローチを取り、クラス名を直接HTMLに書いていくスタイルが特徴的なものは？",
      answer: "Tailwind CSS",
      topic: "CSS",
      author: "AI先生"
    },
    {
      id: 3,
      question: "JavaScriptで非同期処理を扱うために ES2017 で導入された、Promiseをより読みやすく書くための構文は？",
      answer: "async/await",
      topic: "JavaScript",
      author: "AI先生"
    }
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    
    if (!apiKey) {
      alert('OpenAI APIキーを入力してください');
      return;
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'あなたは教育コンテンツから学習用のクイズを生成するAIアシスタントです。テキストを読んで、5つの短い問題を作成してください。各問題は1文で、答えは1-3単語程度にしてください。JSON形式で返してください: [{"question": "問題文", "answer": "答え", "topic": "トピック"}]'
            },
            {
              role: 'user',
              content: `次のテキストから5つのクイズ問題を生成してください：\n\n${text.slice(0, 3000)}`
            }
          ],
          temperature: 0.7
        })
      });

      const data = await response.json();
      const generatedQuestions = JSON.parse(data.choices[0].message.content);
      
      const questionsWithIds = generatedQuestions.map((q, idx) => ({
        ...q,
        id: idx + 1,
        author: 'AI先生'
      }));

      setQuestions(questionsWithIds);
      setView('feed');
      setCurrentIndex(0);
      setScore(0);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('問題の生成に失敗しました。デモモードで続けます。');
      handleDemoMode();
    }
  };

  const handleDemoMode = () => {
    setQuestions(demoQuestions);
    setView('feed');
    setCurrentIndex(0);
    setScore(0);
  };

  const handleAnswer = () => {
    const currentQ = questions[currentIndex];
    const isCorrect = userAnswer.trim().toLowerCase().includes(currentQ.answer.toLowerCase()) ||
                     currentQ.answer.toLowerCase().includes(userAnswer.trim().toLowerCase());

    if (isCorrect) {
      setFeedback('🎉 正解！');
      setScore(score + 1);
      setTimeout(() => {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setUserAnswer('');
          setFeedback('');
        } else {
          setFeedback(`おめでとうございます！全問終了！スコア: ${score + 1}/${questions.length}`);
        }
      }, 1500);
    } else {
      setFeedback(`❌ 惜しい！正解は「${currentQ.answer}」です`);
      setTimeout(() => {
        setFeedback('');
      }, 2000);
    }
  };

  const saveApiKey = (key) => {
    localStorage.setItem('openai_key', key);
    setApiKey(key);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header - Twitter-like */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-8 h-8 text-[#ed2127]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h1 className="text-xl font-bold text-gray-900">AI先生のつぶやき問題集</h1>
          </div>
          {view === 'feed' && (
            <div className="text-sm text-gray-600">
              スコア: {score}/{questions.length}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4">
        {view === 'upload' ? (
          <div className="bg-white shadow-md p-8 mt-8" style={{ borderRadius: '8px' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              SNSを見る感覚で学習しよう！
            </h2>
            <p className="text-gray-600 mb-6">
              勉強しなきゃいけないのについついSNSを見てしまう...そんなあなたに！
              教材をアップロードするだけで、AIが学習用のクイズツイートを生成します。
            </p>

            {/* API Key Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OpenAI APIキー（省略可）:
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => saveApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ed2127] focus:border-transparent"
                style={{ borderRadius: '8px' }}
              />
              <p className="text-xs text-gray-500 mt-1">
                APIキーがない場合は、デモモードで体験できます
              </p>
            </div>

            {/* File Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                教材ファイルをアップロード:
              </label>
              <input
                type="file"
                accept=".txt,.md"
                onChange={handleFileUpload}
                className="w-full px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ed2127] focus:border-transparent"
                style={{ borderRadius: '8px' }}
              />
            </div>

            {/* Demo Button */}
            <button
              onClick={handleDemoMode}
              className="w-full bg-gradient-to-r from-[#ed2127] to-[#f6b243] hover:from-[#d91d23] hover:to-[#e5a239] text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-200 transform hover:scale-105"
              style={{ borderRadius: '8px' }}
            >
              デモモードで開始
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="bg-white p-4 shadow-sm" style={{ borderRadius: '8px' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">進捗状況</span>
                <span className="text-sm font-semibold text-gray-900">
                  {currentIndex + 1} / {questions.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#ed2127] to-[#f6b243] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Tweet */}
            {questions[currentIndex] && (
              <div className="bg-white shadow-md p-6 border-l-4 border-[#ed2127]" style={{ borderRadius: '8px' }}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ed2127] to-[#f6b243] rounded-full flex items-center justify-center text-white font-bold" style={{ borderRadius: '8px' }}>
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{questions[currentIndex].author}</span>
                      <span className="text-gray-500 text-sm">@ai_sensei</span>
                      <span className="text-gray-400 text-sm">· 今</span>
                    </div>
                    <div className="mt-1 text-xs text-[#ed2127] font-semibold">
                      #{questions[currentIndex].topic}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-lg text-gray-900 mb-4">
                    {questions[currentIndex].question}
                  </p>

                  {/* Answer Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAnswer()}
                      placeholder="答えを入力..."
                      className="flex-1 px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ed2127] focus:border-transparent"
                      style={{ borderRadius: '8px' }}
                      disabled={feedback.includes('正解')}
                    />
                    <button
                      onClick={handleAnswer}
                      disabled={!userAnswer.trim() || feedback.includes('正解')}
                      className="bg-gradient-to-r from-[#ed2127] to-[#f6b243] hover:from-[#d91d23] hover:to-[#e5a239] text-white font-bold py-2 px-6 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transform hover:scale-105"
                      style={{ borderRadius: '8px' }}
                    >
                      回答
                    </button>
                  </div>

                  {/* Feedback */}
                  {feedback && (
                    <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
                      feedback.includes('正解') || feedback.includes('おめでとう')
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {feedback}
                    </div>
                  )}
                </div>

                {/* Tweet Actions (decorative) */}
                <div className="flex items-center justify-around pt-4 border-t border-gray-100 text-gray-500">
                  <button className="hover:text-[#ed2127] transition">
                    <span className="text-sm">💭 コメント</span>
                  </button>
                  <button className="hover:text-[#f6b243] transition">
                    <span className="text-sm">🔄 リツイート</span>
                  </button>
                  <button className="hover:text-[#ed2127] transition">
                    <span className="text-sm">❤️ いいね</span>
                  </button>
                </div>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => {
                setView('upload');
                setQuestions([]);
                setCurrentIndex(0);
                setScore(0);
                setUserAnswer('');
                setFeedback('');
              }}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 transition duration-200"
              style={{ borderRadius: '8px' }}
            >
              新しい教材をアップロード
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-2xl mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>AI Hackathon Vol.3 - FLARETECH</p>
        <p className="mt-1">SNSを見る感覚で、自然と学習できる教育アプリ</p>
      </footer>
    </div>
  );
}

export default App;
