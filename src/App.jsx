import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import DataExplorerPage from './pages/DataExplorerPage';
import PollutionAnalyticsPage from './pages/PollutionAnalyticsPage';
import PredictionPage from './pages/PredictionPage';
import AnomalyDetectionPage from './pages/AnomalyDetectionPage';
import RiskAssessmentPage from './pages/RiskAssessmentPage';
import AbatementAdvisorPage from './pages/AbatementAdvisorPage';
import ReportGeneratorPage from './pages/ReportGeneratorPage';
import AboutProjectPage from './pages/AboutProjectPage';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [notification, setNotification] = useState(null);

  // Auto-dismiss notifications after 6 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage setActivePage={setActivePage} />;
      case 'explorer':
        return <DataExplorerPage setNotification={setNotification} />;
      case 'analytics':
        return <PollutionAnalyticsPage />;
      case 'prediction':
        return <PredictionPage setNotification={setNotification} />;
      case 'anomalies':
        return <AnomalyDetectionPage setNotification={setNotification} />;
      case 'risk':
        return <RiskAssessmentPage />;
      case 'abatement':
        return <AbatementAdvisorPage />;
      case 'report':
        return <ReportGeneratorPage setNotification={setNotification} />;
      case 'about':
        return <AboutProjectPage />;
      default:
        return <DashboardPage setActivePage={setActivePage} />;
    }
  };

  return (
    <MainLayout
      activePage={activePage}
      setActivePage={setActivePage}
      notification={notification}
      setNotification={setNotification}
    >
      {renderPage()}
    </MainLayout>
  );
}
