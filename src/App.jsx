import { useEffect, useMemo, useState } from 'react';

const initialTodos = [
  { id: 1, text: 'React の基本を復習する', completed: true },
  { id: 2, text: 'TODO をひとつ追加する', completed: false },
  { id: 3, text: 'コードを保存して画面を確認する', completed: false },
];

// TODO 1件分を表示する部品
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className={`todo-item ${todo.completed ? 'is-completed' : ''}`}>
      <label className="todo-label">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
        />
        <span className="checkmark" aria-hidden="true">✓</span>
        <span>{todo.text}</span>
      </label>
      <button className="delete-button" type="button" onClick={() => onDelete(todo.id)} aria-label={`${todo.text}を削除`}>
        ×
      </button>
    </li>
  );
}

// 残り件数と完了済み削除ボタンを表示する部品
function TodoSummary({ remaining, total, onClearCompleted }) {
  return (
    <div className="summary">
      <p><strong>{remaining}</strong> 件が残っています <span aria-hidden="true">/</span> 全 {total} 件</p>
      <button type="button" className="text-button" onClick={onClearCompleted}>完了済みを削除</button>
    </div>
  );
}

export default function App() {
  // TODOの一覧を管理するstate。保存済みのデータがあればそれを使う
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('react-todos');
    return savedTodos ? JSON.parse(savedTodos) : initialTodos;
  });
  // 入力欄の文字を管理するstate
  const [text, setText] = useState('');
  // 表示するTODOの絞り込み条件を管理するstate
  const [filter, setFilter] = useState('all');

  // TODOが変わるたびにブラウザへ保存する
  useEffect(() => {
    localStorage.setItem('react-todos', JSON.stringify(todos));
  }, [todos]);

  const remaining = todos.filter((todo) => !todo.completed).length;
  // 絞り込み条件に合うTODOだけを画面に表示する
  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.completed);
    if (filter === 'completed') return todos.filter((todo) => todo.completed);
    return todos;
  }, [filter, todos]);

  function addTodo(event) {
    event.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;

    // 元の配列を直接変更せず、新しい配列を作って追加する
    setTodos((currentTodos) => [
      ...currentTodos,
      { id: Date.now(), text: trimmedText, completed: false },
    ]);
    setText('');
  }

  function toggleTodo(id) {
    // チェックされたTODOだけ、完了状態を反対にする
    setTodos((currentTodos) => currentTodos.map((todo) => (
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    )));
  }

  function deleteTodo(id) {
    // 削除するTODO以外を残す
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id));
  }

  function clearCompleted() {
    // 完了していないTODOだけを残す
    setTodos((currentTodos) => currentTodos.filter((todo) => !todo.completed));
  }

  return (
    <main className="app-shell">
      <section className="todo-page" aria-labelledby="page-title">
        <header className="page-header">
          <p className="eyebrow">DAILY DESK <span>2026</span></p>
          <h1 id="page-title">今日の TODO<span>.</span></h1>
          <p className="intro">頭の中のことを、ひとつずつ片づける。</p>
        </header>

        <form className="add-form" onSubmit={addTodo}>
          <label className="sr-only" htmlFor="new-todo">新しい TODO</label>
          <input
            id="new-todo"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="新しい TODO を入力"
          />
          <button type="submit">追加 <span aria-hidden="true">↵</span></button>
        </form>

        <div className="toolbar">
          <div className="filters" aria-label="TODO の絞り込み">
            {[
              ['all', 'すべて'],
              ['active', '未完了'],
              ['completed', '完了済み'],
            ].map(([value, label]) => (
              <button key={value} type="button" className={filter === value ? 'is-selected' : ''} onClick={() => setFilter(value)}>
                {label}
              </button>
            ))}
          </div>
          <span className="date-label">THU / SEP 17</span>
        </div>

        <ul className="todo-list">
          {visibleTodos.length > 0 ? visibleTodos.map((todo) => (
            <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} onDelete={deleteTodo} />
          )) : (
            <li className="empty-state">この条件の TODO はありません。</li>
          )}
        </ul>

        <TodoSummary remaining={remaining} total={todos.length} onClearCompleted={clearCompleted} />
        <footer className="page-footer">REACT / USESTATE / MAP</footer>
      </section>
    </main>
  );
}