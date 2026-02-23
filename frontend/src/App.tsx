import { BrowserRouter, Routes, Route } from "react-router-dom";
import PostsPage from "./posts/PostsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PostsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;