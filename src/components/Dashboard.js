import React from 'react';

const Dashboard = ({ user }) => {
  // `user` obyekti App.js'dan prop orqali keladi
  if (!user) {
    return <div>Yuklanmoqda...</div>;
  }

  return (
    <div className="dashboard-content">
      <h2>Asosiy Sahifa</h2>
      <p>Xush kelibsiz, <strong>{user.email}</strong>!</p>
      <p>Bu sizning shaxsiy kabinetingiz.</p>
    </div>
  );
};

export default Dashboard;