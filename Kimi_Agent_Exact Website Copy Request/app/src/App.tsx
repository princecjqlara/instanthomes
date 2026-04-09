import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/lib/auth';
import { AppRouter } from '@/router';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
