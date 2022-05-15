import { useState, useRef, useEffect } from "react"
import { ethers } from "ethers"
import TodoApp from "./artifacts/contracts/TodoApp.sol/TodoApp.json";

function App() {
  const [data, setData] = useState([])
  const [input, setInput] = useState("")
  const [account, setAccount] = useState("")
  const contract = useRef()

  const getData = async () => {
    if (!contract.current) return
    const data = await contract.current.getMyTodo()
    const myTodos = await Promise.all(data.map(async (item) => await contract.current.todoStore(item._hex)))
    const myTodosFormatted = myTodos.map((item) => {
      return {
        id: item[1].toNumber(),
        name: item[0],
        isCompleted: item[2]
      }
    })
    setData(myTodosFormatted)
  }

  const toggleTodo = async (id) => {
    if (!contract.current) return
    await contract.current.toggleTodo(id)
    getData()
  }

  useEffect(() => {
    if (!account) return
    getData(account)
  }, [account])

  const createNewTodo = async () => {
    if (!input || !contract.current) return
    const transaction = await contract.current.createNewTodo(input)
    await transaction.wait()
    setInput("")
    getData()
  }

  useEffect(() => {
    const setup = async () => {
      if (window.ethereum !== undefined) {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount([accounts[0]])
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        contract.current = new ethers.Contract(
          "0xEFC2aFabE43e73C6A04836c18251b22bc459eBdf",
          TodoApp.abi,
          signer
        )
      } else {
        console.log("No Metamask!")
      }
    }

    setup()
  }, [])

  return (
    <div>
      <div>{account}</div>
      <input value={input} onChange={(e) => setInput(e.target.value)} />
      <button onClick={createNewTodo}>Set Data</button>
      <div>
        {data.map((item) => {
          return (
            <div key={item.id}>
              <input type="checkbox" id={item.id} checked={item.isCompleted} onChange={() => toggleTodo(item.id)} />
              <label htmlFor={item.id}>{item.name}</label>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App;
