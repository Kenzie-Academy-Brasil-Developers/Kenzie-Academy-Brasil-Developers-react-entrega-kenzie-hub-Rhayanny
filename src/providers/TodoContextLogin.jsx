import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { useEffect } from "react";

export const TodoContext = createContext({});

export const TodoProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [techList, setTechList] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("@TOKEN");
      if (token) {
        try {
          setLoading(true);
          const { data } = await api.get("/profile", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUser(data);
          setTechList(data.techs);
          navigate("/home");
        } catch (error) {
          console.log(error);
          localStorage.removeItem("@TOKEN");
        } finally {
          setLoading(false);
        }
      }
    };
    loadUser();
  }, []);

  const userLogout = () => {
    setUser(null);
    navigate("/");
    localStorage.removeItem("@TOKEN");
    toast.warning("Deslogado 😉");
  };

  const userlogin = async (formData) => {
    try {
      setLoading(true);
      const { data } = await api.post("/sessions", formData);
      localStorage.setItem("@TOKEN", data.token);
      setUser(data.user);
      setTechList(data.user.techs);
      toast.success("Logado com sucesso ✅😊");
      navigate("/home");
    } catch (error) {
      if (
        error.response.data.message === "Incorrect email / password combination"
      ) {
        toast.error("Email ou Senha incorretos 🙁");
      }
    } finally {
      setLoading(false);
    }
  };

  const userRegister = async (formData) => {
    try {
      setLoading(true);
      await api.post("/users", formData);
      toast.success("Cadastrado com sucesso 😉");
      navigate("/");
    } catch (error) {
      if (error.response.data.message === "Email already exists") {
        toast.error("Usuário já cadastrado 😉");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <TodoContext.Provider
      value={{
        userRegister,
        userlogin,
        setLoading,
        user,
        loading,
        userLogout,
        techList,
        setTechList,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};
