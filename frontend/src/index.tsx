import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AppPageContext } from './context/AppContext';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <AppPageContext>
            <App />
        </AppPageContext>
    </React.StrictMode>
);
