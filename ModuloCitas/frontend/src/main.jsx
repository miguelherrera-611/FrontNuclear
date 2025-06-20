import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { AppProvider } from './context/AppContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AppProvider>
                    <App />
                    <Toaster
                        position="top-right"
                        toastOptions={{
                            duration: 4000,
                            style: {
                                background: '#363636',
                                color: '#fff',
                            },
                            success: {
                                duration: 3000,
                                theme: {
                                    primary: '#4ade80',
                                    secondary: '#166534',
                                },
                            },
                            error: {
                                duration: 5000,
                                theme: {
                                    primary: '#ef4444',
                                    secondary: '#991b1b',
                                },
                            },
                        }}
                    />
                </AppProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>,
)