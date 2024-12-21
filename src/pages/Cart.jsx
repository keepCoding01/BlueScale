import React, { useState, useEffect, useMemo } from "react";
import { FaTrashAlt, FaStickyNote } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const [produkDiKeranjang, kontrolProdukDiKeranjang] = useState([]);
  const [produkYangDipilih, kontrolProdukYangDipilih] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [catatan, setCatatan] = useState({});
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const storedUserEmail = localStorage.getItem("userEmail");
    if (storedUserEmail) {
      setIsLoggedIn(true);
      setUserEmail(storedUserEmail);
    }
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUserEmail("");
  };

  const handleCheckout = () => {
    const produkDenganCatatan = produkYangDipilih.map((produk) => ({
      ...produk,
      catatan: catatan[produk.id] || "",
    }));

    navigate("/checkout", {
      state: {
        produkYangDipilih: produkDenganCatatan,
        totalHarga,
      },
    });
  };

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/cart");
        kontrolProdukDiKeranjang(response.data);

        const produkTercentang = response.data.filter((item) => item.cart_is_checked);
        kontrolProdukYangDipilih(produkTercentang);

        localStorage.setItem("cart", JSON.stringify(response.data));
      } catch (error) {
        console.error("Kesalahan saat mengambil data produk:", error);
      }
    };

    fetchProduk();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/");
    }
  });

  useEffect(() => {
    const produkTersimpan = JSON.parse(localStorage.getItem("cart")) || [];
    kontrolProdukDiKeranjang(produkTersimpan);

    const produkTercentang = produkTersimpan.filter((item) => item.cart_is_checked);
    kontrolProdukYangDipilih(produkTercentang);
  }, []);

  useEffect(() => {
    const totalHarga = produkYangDipilih.reduce((total, item) => {
      return total + item.price * (1 - item.discount_percent / 100) * item.cart_quantity;
    }, 0);

    setTotalHarga(totalHarga);
  }, [produkYangDipilih]);

  const tambahProdukKeKeranjang = (productId, quantity = 1, note = "", is_checked = 0) => {
    const produkYangAda = produkDiKeranjang.find((item) => item.id === productId);

    const isChecked = produkYangAda ? produkYangAda.cart_is_checked : is_checked;

    axios
      .post("http://localhost:5000/api/cart", {
        user_email: localStorage.getItem("userEmail"),
        product_id: productId,
        quantity,
        note,
        is_checked: isChecked ? 1 : 0,
      })
      .then((response) => {
        console.log("Produk berhasil ditambahkan ke keranjang:", response.data);
        reloadProduk();
      })
      .catch((error) => {
        if (error.response) {
          console.error("Gagal menambahkan produk ke keranjang:", error.response.data);
        } else {
          console.error("Error:", error.message);
        }
      });
  };

  const kontrolPerubahanKuantitas = (id, newQuantity) => {
    const produk = produkDiKeranjang.find((item) => item.id === id);
    if (!produk || !produk.cart_quantity) {
      tambahProdukKeKeranjang(id, newQuantity);
      return;
    }

    axios
      .put(`http://localhost:5000/api/cart/quantity/${id}`, { quantity: newQuantity })
      .then(() => {
        const updatedProdukDiKeranjang = produkDiKeranjang.map((item) => (item.id === id ? { ...item, cart_quantity: newQuantity } : item));
        kontrolProdukDiKeranjang(updatedProdukDiKeranjang);

        if (produkYangDipilih.some((item) => item.id === id)) {
          const updatedProdukYangDipilih = produkYangDipilih.map((item) => (item.id === id ? { ...item, cart_quantity: newQuantity } : item));
          kontrolProdukYangDipilih(updatedProdukYangDipilih);
        }
      })
      .catch((error) => {
        console.error("Gagal memperbarui kuantitas:", error);
      });
  };

  const handleAddNote = (id, title) => {
    const note = prompt(`Masukkan catatan untuk produk ${title}:`);
    if (!note) return;

    const produk = produkDiKeranjang.find((item) => item.id === id);
    const updatedCatatan = { ...catatan, [id]: note };
    setCatatan(updatedCatatan);
    if (!produk || !produk.cart_note) {
      tambahProdukKeKeranjang(id, 1, note);
    } else {
      axios
        .put(`http://localhost:5000/api/cart/note/${id}`, { note })
        .then(() => {
          alert("Catatan berhasil disimpan!");

          if (produkYangDipilih.some((item) => item.id === id)) {
            const updatedProdukYangDipilih = produkYangDipilih.map((item) => (item.id === id ? { ...item, cart_note: note } : item));
            kontrolProdukYangDipilih(updatedProdukYangDipilih);
          }
        })
        .catch((error) => {
          console.error("Gagal menyimpan catatan:", error);
        });
    }
  };

  const kontrolPenghapusanProduk = (id) => {
    axios
      .delete(`http://localhost:5000/api/cart/${id}`)
      .then((response) => {
        console.log(response.data.message);
      })
      .catch((error) => {
        if (error.response && error.response.status === 404) {
          console.warn("Produk tidak ada di keranjang, namun tetap akan dihapus dari frontend.");
        } else {
          console.error("Gagal menghapus produk:", error.message);
        }
      })
      .finally(() => {
        const perbaruiProdukDiKeranjang = produkDiKeranjang.filter((item) => item.id !== id);
        kontrolProdukDiKeranjang(perbaruiProdukDiKeranjang);
        localStorage.setItem("cart", JSON.stringify(perbaruiProdukDiKeranjang));
        kontrolProdukYangDipilih(produkYangDipilih.filter((item) => item.id !== id));
        console.log("Produk berhasil dihapus dari frontend.");
      });
  };

  const kontrolHapusSemuaProduk = () => {
    const produkIds = produkDiKeranjang.map((item) => item.id);

    Promise.allSettled(produkIds.map((id) => axios.delete(`http://localhost:5000/api/cart/${id}`))).then((results) => {
      results.forEach((result, index) => {
        if (result.status === "rejected") {
          console.warn(`Produk dengan ID ${produkIds[index]} gagal dihapus: ${result.reason}`);
        }
      });

      kontrolProdukDiKeranjang([]);
      localStorage.removeItem("cart");
      kontrolProdukYangDipilih([]);
      console.log("Semua produk berhasil dihapus dari frontend.");
    });
  };

  const kontrolHapusSemuaProdukDariToko = (namaToko) => {
    const produkDariToko = produkDiKeranjang.filter((item) => item.store_name === namaToko);

    Promise.allSettled(produkDariToko.map((item) => axios.delete(`http://localhost:5000/api/cart/${item.id}`)))
      .then((results) => {
        results.forEach((result, index) => {
          if (result.status === "rejected") {
            console.warn(`Produk dengan ID ${produkDariToko[index].id} gagal dihapus dari keranjang: ${result.reason}`);
          }
        });

        const produkTersisa = produkDiKeranjang.filter((item) => item.store_name !== namaToko);
        kontrolProdukDiKeranjang(produkTersisa);
        localStorage.setItem("cart", JSON.stringify(produkTersisa));
        kontrolProdukYangDipilih(produkYangDipilih.filter((item) => !produkDariToko.some((prod) => prod.id === item.id)));
        console.log(`Semua produk dari toko ${namaToko} berhasil dihapus dari frontend.`);
      })
      .catch((error) => {
        console.error("Gagal menghapus produk dari toko:", error);
      });
  };

  const reloadProduk = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/cart");
      kontrolProdukDiKeranjang(response.data);
      localStorage.setItem("cart", JSON.stringify(response.data));
    } catch (error) {
      console.error("Kesalahan saat mengambil data produk:", error);
    }
  };

  const cekProdukDiKeranjang = produkDiKeranjang.length > 0;
  const toggleSemuaTokoDipilih = async () => {
    try {
      const semuaTokoDicentang = produkDiKeranjang.every((item) => item.cart_is_checked);
      const statusBaru = !semuaTokoDicentang;

      const produkUntukDitambahkan = produkDiKeranjang.filter((item) => !item.cart_id || !item.cart_is_checked);

      if (produkUntukDitambahkan.length > 0) {
        await Promise.all(
          produkUntukDitambahkan.map((produk) =>
            axios.post("http://localhost:5000/api/cart", {
              user_email: localStorage.getItem("userEmail"),
              product_id: produk.id,
              quantity: produk.quantity || 1,
              note: produk.note || "",
              is_checked: statusBaru ? 1 : 0,
            })
          )
        );
      }

      const storeIds = Array.from(new Set(produkDiKeranjang.map((item) => item.store_id)));
      for (const storeId of storeIds) {
        await axios.put(`http://localhost:5000/api/cart/status/toko/${storeId}`, {
          is_checked: statusBaru ? 1 : 0,
        });
      }

      // Perbarui state frontend
      const updatedProdukDiKeranjang = produkDiKeranjang.map((item) => ({
        ...item,
        cart_is_checked: statusBaru,
      }));
      kontrolProdukDiKeranjang(updatedProdukDiKeranjang);

      const updatedProdukYangDipilih = statusBaru ? [...produkDiKeranjang] : [];
      kontrolProdukYangDipilih(updatedProdukYangDipilih);

      localStorage.setItem("cart", JSON.stringify(updatedProdukDiKeranjang));
    } catch (error) {
      console.error("Gagal memperbarui status pilih semua toko:", error);
    }
  };

  const toggleProdukDipilihDariToko = async (storeName) => {
    const store = produkDiKeranjang.find((store) => store.store_name === storeName);
    if (!store) return;

    const storeId = store.store_id;
    const produkDariToko = produkDiKeranjang.filter((item) => item.store_id === storeId);
    const semuaDicentang = produkDariToko.every((item) => item.cart_is_checked);
    const statusBaru = !semuaDicentang;

    const produkUntukDitambahkan = produkDariToko.filter((item) => !item.cart_id || !item.cart_is_checked);

    try {
      if (produkUntukDitambahkan.length > 0) {
        await Promise.all(
          produkUntukDitambahkan.map((produk) =>
            axios.post("http://localhost:5000/api/cart", {
              user_email: localStorage.getItem("userEmail"),
              product_id: produk.id,
              quantity: produk.quantity || 1,
              note: produk.note || "",
              is_checked: statusBaru ? 1 : 0,
            })
          )
        );
      }

      await axios.put(`http://localhost:5000/api/cart/status/toko/${storeId}`, {
        is_checked: statusBaru ? 1 : 0,
      });

      const updatedProdukDiKeranjang = produkDiKeranjang.map((item) => (item.store_id === storeId ? { ...item, cart_is_checked: statusBaru } : item));
      kontrolProdukDiKeranjang(updatedProdukDiKeranjang);

      const updatedProdukYangDipilih = statusBaru ? [...produkYangDipilih, ...produkDariToko.filter((item) => !produkYangDipilih.some((selected) => selected.id === item.id))] : produkYangDipilih.filter((item) => item.store_id !== storeId);
      kontrolProdukYangDipilih(updatedProdukYangDipilih);

      localStorage.setItem("cart", JSON.stringify(updatedProdukDiKeranjang));
    } catch (error) {
      console.error("Failed to update store selection:", error);
    }
  };

  const toggleProdukDipilih = (id) => {
    const produkTerpilih = produkDiKeranjang.find((item) => item.id === id);
    if (!produkTerpilih) return;

    const isChecked = !produkTerpilih.cart_is_checked;

    axios
      .put(`http://localhost:5000/api/cart/status/${id}`, { is_checked: isChecked ? 1 : 0 })
      .then(() => {
        const updatedProdukDiKeranjang = produkDiKeranjang.map((item) => (item.id === id ? { ...item, cart_is_checked: isChecked } : item));
        kontrolProdukDiKeranjang(updatedProdukDiKeranjang);

        const updatedProdukYangDipilih = isChecked ? [...produkYangDipilih, { ...produkTerpilih, cart_is_checked: true }] : produkYangDipilih.filter((item) => item.id !== id);

        kontrolProdukYangDipilih(updatedProdukYangDipilih);

        const totalHarga = updatedProdukYangDipilih.reduce((total, item) => {
          return total + item.price * (1 - item.discount_percent / 100) * item.cart_quantity;
        }, 0);

        setTotalHarga(totalHarga);
        localStorage.setItem("cart", JSON.stringify(updatedProdukDiKeranjang));
      })
      .catch((error) => {
        console.error("Gagal memperbarui status ceklis:", error);
      });
  };

  const formatCurrency = (amount) => {
    return `Rp. ${amount.toLocaleString("id-ID")},00`;
  };

  const produkToko = useMemo(() => {
    return produkDiKeranjang.reduce((acc, item) => {
      if (!acc[item.store_name]) acc[item.store_name] = [];
      acc[item.store_name].push(item);
      return acc;
    }, {});
  }, [produkDiKeranjang]);

  return (
    <div className="container ml-0 flex">
      <div>
        {!isLoggedIn ? (
          ""
        ) : (
          <button style={{ zIndex: 10 }} onClick={handleLogout} className="text-white font-bold fixed mt-4 left-9 bg-blue-800 px-4 py-2 rounded-md">
            Logout
          </button>
        )}
        <h1 className="text-2xl font-bold mb-6 bg-blue-800 p-6 text-white fixed text-center w-full">Keranjang Belanja</h1>
        <div className="absolute top-6 right-44 ">
          {!isLoggedIn ? (
            <button onClick={handleLogin} className="text-white text-xl font-bold fixed bg-blue-800 px-4 py-1 rounded-md">
              Login
            </button>
          ) : (
            <span className="text-white font-bold fixed right-16">Selamat datang, {userEmail}</span>
          )}
        </div>
      </div>

      <div className="w-[65%] ml-10">
        <button onClick={reloadProduk} className="bg-blue-800 text-white mt-24 px-2 py-2 ml-1 rounded-md">
          Reload Produk
        </button>
        {cekProdukDiKeranjang && (
          <div className="mb-6">
            {isLoggedIn && (
              <button onClick={kontrolHapusSemuaProduk} className="bg-blue-800 text-white px-2 py-2 w-44 ml-[645px] rounded-md">
                Hapus Semua Produk
              </button>
            )}
          </div>
        )}
        {produkDiKeranjang.length === 0 ? (
          <p className="text-center text-gray-700 mt-20">Upsss keranjang Anda kosong.</p>
        ) : (
          <>
            <div className="p-4 rounded-md flex bg-blue-800 items-center">
              {isLoggedIn ? (
                <input type="checkbox" checked={produkYangDipilih.length === produkDiKeranjang.length} onChange={toggleSemuaTokoDipilih} className="mr-2" />
              ) : (
                <input disabled type="checkbox" checked={produkYangDipilih.length === produkDiKeranjang.length} onChange={toggleSemuaTokoDipilih} className="mr-2" />
              )}
              <h2 className="text-lg font-bold text-white">Pilih Semua Toko</h2>
            </div>
            {/* Tabel stores */}
            {Object.keys(produkToko).map((namaToko) => (
              <div key={namaToko} className="mb-6 m-3 bg-white rounded-md">
                <div className="bg-blue-300 p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    {isLoggedIn ? (
                      <input type="checkbox" checked={produkToko[namaToko].every((item) => produkYangDipilih.some((selected) => selected.id === item.id))} onChange={() => toggleProdukDipilihDariToko(namaToko)} className="mr-2" />
                    ) : (
                      <input disabled type="checkbox" checked={produkToko[namaToko].every((item) => produkYangDipilih.some((selected) => selected.id === item.id))} onChange={() => toggleProdukDipilihDariToko(namaToko)} className="mr-2" />
                    )}

                    <img src={produkToko[namaToko][0].avatar_url} alt={namaToko} className="w-8 h-8 rounded-full mr-2" />
                    <h2 className="text-lg font-bold text-white">{namaToko}</h2>
                    {isLoggedIn && (
                      <button onClick={() => kontrolHapusSemuaProdukDariToko(namaToko)} className="text-red-600 ml-[460px]">
                        Hapus Toko
                      </button>
                    )}
                  </div>
                </div>
                <div className="p-2">
                  {/* Tabel produk per toko */}
                  <div>
                    {produkToko[namaToko].map((produk) => (
                      <div key={produk.id} className="flex items-center bg-blue-300 p-3 rounded-md shadow-sm my-2">
                        {isLoggedIn ? (
                          <input type="checkbox" checked={produk.cart_is_checked} onChange={() => toggleProdukDipilih(produk.id)} className="mr-2" />
                        ) : (
                          <input disabled type="checkbox" checked={produk.cart_is_checked} onChange={() => toggleProdukDipilih(produk.id)} className="mr-2" />
                        )}

                        <div className="flex items-center">
                          <img src={produk.image_url} alt={produk.name} className="w-20 h-20 object-cover mr-4" />
                          <div className="w-[300px]">
                            <h3 className="text-sm font-semibold">{produk.name}</h3>
                            <p className="text-xs line-through">Harga: {formatCurrency(produk.price)}</p>
                            <p className="text-xs font-semibold">{formatCurrency(produk.price * (1 - produk.discount_percent / 100))}</p>
                            <p className="text-xs text-gray-600">Diskon: {produk.discount_percent}%</p>
                            <p className="text-xs text-gray-600">Kuantitas: {produk.cart_quantity}</p>
                            <p className="text-xs text-gray-600">Catatan: {produk.cart_note || "Belum ada catatan"}</p> {/* Menggunakan cart_note */}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-[250px]">
                          {isLoggedIn && (
                            <button
                              onClick={() => kontrolPerubahanKuantitas(produk.id, produk.cart_quantity - 1)}
                              className="bg-blue-800 text-white px-2 py-1 rounded-md"
                              disabled={produk.cart_quantity <= 1} // Cegah nilai di bawah 1
                            >
                              -
                            </button>
                          )}
                          {isLoggedIn && (
                            <button onClick={() => kontrolPerubahanKuantitas(produk.id, produk.cart_quantity + 1)} className="bg-blue-800 text-white px-2 py-1 rounded-md">
                              +
                            </button>
                          )}

                          {isLoggedIn && (
                            <button onClick={() => handleAddNote(produk.id, produk.name)} className="text-gray-500">
                              <FaStickyNote />
                            </button>
                          )}
                          {isLoggedIn && (
                            <button onClick={() => kontrolPenghapusanProduk(produk.id)} className="text-red-500">
                              <FaTrashAlt />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="w-[25%] mx-4 mt-52 fixed ml-[903px] py-4 px-4 rounded-xl bg-blue-800">
        <div className="sticky top-0">
          <h2 className="text-xl font-semibold text-white">Total Belanja</h2>
          <p className="mt-2 text-white">Total Harga: {formatCurrency(totalHarga)}</p>
          <button onClick={handleCheckout} className={`bg-blue-300 text-white px-[93px] py-2 m-3 rounded-md ${produkYangDipilih.length === 0 ? "cursor-not-allowed opacity-50" : ""}`} disabled={produkYangDipilih.length === 0}>
            Check Out
          </button>
          {produkYangDipilih.length === 0 && <p className="text-center text-red-500 mt-2">Silakan pilih produk sebelum check out</p>}
        </div>
      </div>
    </div>
  );
};

export default Cart;
