import Navbar from '@/components/Navbar'; // Import the Navbar component
import CodeEditor from '@/components/CodeEditor';

const CodeEditorPage = () => {
  return (
    <div className="p-4">
      <div>
        <Navbar /> {/* Render the Navbar */}
        <CodeEditor />
      </div>
    </div>
  );
};

export default CodeEditorPage;