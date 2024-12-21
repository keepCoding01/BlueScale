import React, { useState, useEffect, useMemo } from "react";
import { FaTrashAlt, FaStickyNote } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Cart = () => {
  const [produkDiKeranjang, kontrolProdukDiKeranjang] = useState([]);
  const [produkYangDipilih, kontrolProdukYangDipilih] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [catatan, setCatatan] = useState({});
  const navigate = useNavigate(); // Ganti useHistory dengan

  const handleCheckout = () => {
    // Mengirim data produk yang dipilih, total harga, dan catatan
    navigate("/checkout", {
      state: {
        produkYangDipilih,
        totalHarga,
        catatan, // Kirim catatan ke halaman checkout
      },
    });
  };

  useEffect(() => {
    const fetchProduk = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/cart"); // Ubah URL ini
        kontrolProdukDiKeranjang(response.data);
        localStorage.setItem("cart", JSON.stringify(response.data));
      } catch (error) {
        console.error("Kesalahan saat mengambil data produk:", error);
      }
    };

    fetchProduk();
  }, []);

  useEffect(() => {
    const produkTersimpan = JSON.parse(localStorage.getItem("cart")) || [];
    kontrolProdukDiKeranjang(produkTersimpan);
  }, []);

  useEffect(() => {
    let total = 0;
    produkYangDipilih.forEach((item) => {
      total += item.quantity * item.price;
    });
    setTotalHarga(total);
  }, [produkYangDipilih]);

  useEffect(() => {
    const produkTersimpan = JSON.parse(localStorage.getItem("cart")) || [];
    kontrolProdukDiKeranjang(produkTersimpan);
  }, []);

  useEffect(() => {
    let total = 0;
    produkYangDipilih.forEach((item) => {
      total += item.quantity * item.price * (1 - item.discount_percentage / 100); // Menghitung total dengan diskon
    });
    setTotalHarga(total);
  }, [produkYangDipilih]);

  const kontrolPerubahanKuantitas = (id, quantity) => {
    const perbaruiProdukDiKeranjang = produkDiKeranjang.map((item) => {
      if (item.id === id) {
        const kuantitasBaru = item.quantity + quantity;
        return { ...item, quantity: Math.max(kuantitasBaru, 1) }; // Pastikan kuantitas tidak kurang dari 1
      }
      return item;
    });
    kontrolProdukDiKeranjang(perbaruiProdukDiKeranjang);
    localStorage.setItem("cart", JSON.stringify(perbaruiProdukDiKeranjang));
    // Memperbarui produk yang dipilih
    const produkDipilihBaru = produkYangDipilih.map((item) => (item.id === id ? { ...item, quantity: Math.max(item.quantity + quantity, 1) } : item));
    kontrolProdukYangDipilih(produkDipilihBaru);
  };

  const handleAddNote = (id, title) => {
    const note = prompt(`Masukkan catatan untuk produk ${title}:`);
    setCatatan((prevNotes) => ({
      ...prevNotes,
      [id]: note,
    }));
  };

  const kontrolPenghapusanProduk = (id) => {
    const perbaruiProdukDiKeranjang = produkDiKeranjang.filter((item) => item.id !== id);
    kontrolProdukDiKeranjang(perbaruiProdukDiKeranjang);
    localStorage.setItem("cart", JSON.stringify(perbaruiProdukDiKeranjang));
    kontrolProdukYangDipilih(produkYangDipilih.filter((item) => item.id !== id));
  };

  const kontrolHapusSemuaProduk = () => {
    kontrolProdukDiKeranjang([]);
    localStorage.removeItem("cart");
    kontrolProdukYangDipilih([]);
  };

  const toggleProdukDipilih = (id) => {
    const produkTerpilih = produkDiKeranjang.find((item) => item.id === id);
    const produkDipilihBaru = produkYangDipilih.some((item) => item.id === id) ? produkYangDipilih.filter((item) => item.id !== id) : [...produkYangDipilih, produkTerpilih];
    kontrolProdukYangDipilih(produkDipilihBaru);
  };

  const toggleProdukDipilihDariToko = (namaToko) => {
    const produkDariToko = produkDiKeranjang.filter((item) => item.shop === namaToko);
    const produkDariTokoDipilih = produkDariToko.every((item) => produkYangDipilih.some((selected) => selected.id === item.id));
    const produkYangDipilihDariToko = produkDariTokoDipilih
      ? produkYangDipilih.filter((item) => item.shop !== namaToko)
      : [...produkYangDipilih, ...produkDariToko.filter((item) => !produkYangDipilih.some((selected) => selected.id === item.id))];
    kontrolProdukYangDipilih(produkYangDipilihDariToko);
  };

  //   const reloadProduk = () => {
  //     const produkBaru = response.flatMap((toko) => toko.products.map((produk) => ({ ...produk, shop: toko.shop })));
  //     kontrolProdukDiKeranjang(produkBaru);
  //     localStorage.setItem("cart", JSON.stringify(produkBaru));
  //   };

  const reloadProduk = async () => {
    try {
      // Mengambil data dari API
      const response = await axios.get("http://localhost:5000/api/cart");

      // Memperbarui state dengan data produk yang baru
      kontrolProdukDiKeranjang(response.data);

      // Menyimpan data ke localStorage
      localStorage.setItem("cart", JSON.stringify(response.data));
    } catch (error) {
      console.error("Kesalahan saat mengambil data produk:", error);
    }
  };

  const grupProdukProdukToko = useMemo(() => {
    return produkDiKeranjang.reduce((acc, item) => {
      if (!acc[item.shop]) acc[item.shop] = [];
      acc[item.shop].push(item);
      return acc;
    }, {});
  }, [produkDiKeranjang]);

  const cekProdukDiKeranjang = produkDiKeranjang.length > 0;

  const kontrolHapusSemuaProdukDariToko = (namaToko) => {
    const produkDariToko = produkDiKeranjang.filter((item) => item.shop === namaToko);
    const produkTersisa = produkDiKeranjang.filter((item) => item.shop !== namaToko);
    kontrolProdukDiKeranjang(produkTersisa);
    localStorage.setItem("cart", JSON.stringify(produkTersisa));
    kontrolProdukYangDipilih(produkYangDipilih.filter((item) => !produkDariToko.some((prod) => prod.id === item.id)));
  };

  const toggleSemuaTokoDipilih = () => {
    const produkDipilihBaru = produkYangDipilih.length === produkDiKeranjang.length ? [] : produkDiKeranjang;
    kontrolProdukYangDipilih(produkDipilihBaru);
  };
  const formatCurrency = (amount) => {
    return `Rp. ${amount.toLocaleString("id-ID")},00`;
  };

  return (
    <div className="container  ml-0   flex">
      <h1 className="text-2xl font-bold mb-6 bg-blue-800 w-full p-6 text-white fixed text-center ">Keranjang Belanja</h1>
      <div className="w-[65%] ml-20">
        <button onClick={reloadProduk} className=" bg-blue-800 text-white mt-24  px-2 py-2 ml-4 rounded-md">
          Reload Produk
        </button>
        {cekProdukDiKeranjang && (
          <div className="mb-6">
            <button onClick={kontrolHapusSemuaProduk} className="bg-blue-800 text-white px-2 py-2 w-44 ml-[653px]  rounded-md">
              Hapus Semua Produk
            </button>
          </div>
        )}
        {produkDiKeranjang.length === 0 ? (
          <p className="text-center text-gray-700 mt-20">Upsss keranjang Anda kosong.</p>
        ) : (
          <>
            <div className=" p-4 rounded-md flex  bg-blue-800 items-center">
              <input type="checkbox" checked={produkYangDipilih.length === produkDiKeranjang.length} onChange={toggleSemuaTokoDipilih} className="mr-2" />
              <h2 className="text-lg font-bold text-white">Pilih Semua Toko</h2>
            </div>
            {Object.keys(grupProdukProdukToko).map((namaToko) => (
              <div key={namaToko} className="mb-6 m-3 bg-white rounded-md">
                <div className="bg-blue-300 p-4  flex justify-between items-center">
                  <div className="flex items-center ">
                    <input type="checkbox" checked={grupProdukProdukToko[namaToko].every((item) => produkYangDipilih.some((selected) => selected.id === item.id))} onChange={() => toggleProdukDipilihDariToko(namaToko)} className="mr-2" />
                    <img src={grupProdukProdukToko[namaToko][0].avatar_url} alt={namaToko} className="w-8 h-8 rounded-full mr-2" />
                    <h2 className="text-lg font-bold text-white  ">{namaToko}</h2>
                    <button onClick={() => kontrolHapusSemuaProdukDariToko(namaToko)} className="text-red-600 ml-[350px]">
                      Hapus Produk {namaToko}
                    </button>
                  </div>
                </div>
                <div className="p-2 ">
                  {grupProdukProdukToko[namaToko].map((produk) => (
                    <div key={produk.id} className="flex items-center bg-blue-300 p-3 rounded-md shadow-sm my-2">
                      <input type="checkbox" checked={produkYangDipilih.some((item) => item.id === produk.id)} onChange={() => toggleProdukDipilih(produk.id)} className="mr-2" />
                      <div className="flex items-center">
                        <img src={produk.image_url} alt={produk.name} className="w-20 h-20 object-cover mr-4" />
                        <div className="w-[300px]">
                          <h3 className="text-sm font-semibold">{produk.name}</h3>
                          <p className="text-xs line-through">Harga: {formatCurrency(produk.price)}</p>
                          <p className="text-xs font-semibold">{formatCurrency(produk.price * (1 - produk.discount_percent / 100))}</p>
                          <p className="text-xs text-gray-600">Diskon: {produk.discount_percent}%</p>
                          <p className="text-xs text-gray-600">Kuantitas: {produk.quantity}</p>
                          <p className="text-xs text-gray-600">Catatan: {catatan[produk.id] || "Belum ada catatan"}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-[250px]">
                        <button onClick={() => kontrolPerubahanKuantitas(produk.id, -1)} className=" bg-blue-800 text-white px-2 py-1 rounded-md">
                          -
                        </button>
                        <button onClick={() => kontrolPerubahanKuantitas(produk.id, 1)} className=" bg-blue-800 text-white px-2 py-1 rounded-md">
                          +
                        </button>
                        <button onClick={() => handleAddNote(produk.id, produk.name)} className="text-gray-500">
                          <FaStickyNote />
                        </button>
                        <button onClick={() => kontrolPenghapusanProduk(produk.id)} className="text-red-500">
                          <FaTrashAlt />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="w-[23%] mx-4 mt-52 fixed ml-[983px] py-4 px-4 rounded-xl bg-blue-800">
        <div className="sticky top-0">
          <h2 className="text-xl font-semibold text-white">Total Belanja</h2>
          <p className="mt-2 text-white">Total Harga: {formatCurrency(totalHarga)}</p>
          <button onClick={handleCheckout} className={` bg-blue-300 text-white px-[95px] py-2 m-3 rounded-md ${produkYangDipilih.length === 0 ? "cursor-not-allowed opacity-50" : ""}`} disabled={produkYangDipilih.length === 0}>
            Check Out
          </button>
          {produkYangDipilih.length === 0 && <p className="text-center text-red-500 mt-2">Silakan pilih produk sebelum check out</p>}
        </div>
      </div>
    </div>
  );
};

export default Cart;


