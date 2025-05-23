import './App.css'
import { Toaster } from 'react-hot-toast';
import Auth from './pages/Auth'

function App() {

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Auth></Auth>
    </>
  )
}

export default App
