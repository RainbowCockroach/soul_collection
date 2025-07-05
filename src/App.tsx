import "./App.css";
import OcSlot from "./oc-slot/OcSlot";

function App() {
  const dummyOCLists = [
    {
      slug: "dummy-oc",
      name: "Dummy OC",
      avatar: "https://placehold.co/200",
    },
    {
      slug: "dummy-oc2",
      name: "Dummy OC",
      avatar: "https://placehold.co/200",
    },
  ];
  return (
    <>
      <div>
        <div>
          {dummyOCLists.map((oc) => (
            <OcSlot key={oc.slug} {...oc} />
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
