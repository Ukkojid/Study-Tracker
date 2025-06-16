// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

export const getPriority = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
  
    if (diffDays <= 0) return "high"; // 🔴 Overdue or Due Today
    if (diffDays <= 3) return "medium"; // 🟠 Due in 2-3 Days
    return "low"; // 🟢 Due in 4+ Days
  };
  
  export const getTimeRemaining = (dueDate) => {
    const diffMs = new Date(dueDate) - new Date();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    return hours > 0 ? `${hours} hrs remaining` : "Due now!";
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  