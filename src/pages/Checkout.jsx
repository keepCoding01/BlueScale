import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Checkout = () => {
  const { state } = useLocation();
  const { produkYangDipilih, totalHarga } = state || { produkYangDipilih: [], totalHarga: 0 };
  const [alamat, setAlamat] = useState("");
  const [metodePembayaran, setMetodePembayaran] = useState("");
  const navigate = useNavigate();

  const formatCurrency = (amount) => {
    return `Rp. ${amount.toLocaleString("id-ID")},00`;
  };

  const groupByShop = produkYangDipilih.reduce((acc, produk) => {
    const { store_name, ...produkData } = produk;

    if (!acc[store_name]) {
      acc[store_name] = [];
    }
    acc[store_name].push(produkData);
    return acc;
  }, {});

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!alamat || !metodePembayaran) {
      alert("Harap isi alamat dan pilih metode pembayaran.");
      return;
    }

    alert("Checkout berhasil! Terima kasih telah berbelanja!");

    navigate("/");
  };

  return (
    <div className="container ml-0  text-white  ">
      <h1 className="text-2xl font-bold  bg-blue-800 w-full  text-white fixed text-center p-6 ">Checkout</h1>

      {produkYangDipilih.length === 0 ? (
        <p className="text-center text-gray-700">Tidak ada produk yang dipilih untuk checkout.</p>
      ) : (
        <>
          <div className="flex">
            <div className="w-[400px] mt-36 mr-80 ml-36 ">
              {Object.keys(groupByShop).map((shop) => (
                <div key={shop} className="mb-6">
                  <h2 className="text-lg font-bold  ">{shop}</h2>
                  <div className="bg-blue-300 p-3 rounded-lg   justify-between items-center">
                    {groupByShop[shop].map((produk) => (
                      <div className=" bg-white text-black flex items-center w-[360px] p-2 m-2  rounded-md">
                        <img src={produk.image_url} alt={produk.name} className="w-20 h-20 object-cover mr-4" />
                        <div>
                          <h3 className="text-sm font-semibold">{produk.name}</h3>
                          <p className="text-xs line-through">Harga: {formatCurrency(produk.price)}</p>
                          <p className="text-xs font-semibol">{formatCurrency(produk.price * (1 - produk.discount_percent / 100))}</p>
                          <p className="text-xs text-gray-600">Diskon: {produk.discount_percent}%</p>
                          <p className="text-xs text-gray-600">Kuantitas: {produk.cart_quantity}</p>
                          <p className="text-xs text-gray-600">Catatan: {produk.cart_note || "Belum ada catatan"}</p> {/* Menampilkan catatan produk */}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <p className="mt-4 text-lg font-semibold mb-20">Total Harga : {formatCurrency(totalHarga)}</p>
            </div>
            <div className="w-[400px] mt-40 fixed ml-[710px]">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="mb-4">
                  <label htmlFor="alamat" className="block text-sm font-semibold">
                    Alamat Pengiriman
                  </label>
                  <textarea id="alamat" value={alamat} onChange={(e) => setAlamat(e.target.value)} className="w-full p-2 border rounded-md text-black" placeholder="Masukkan alamat lengkap" rows="4" />
                </div>

                <div className="mb-4">
                  <label htmlFor="metodePembayaran" className="block text-sm font-semibold">
                    Metode Pembayaran
                  </label>
                  <select id="metodePembayaran " value={metodePembayaran} onChange={(e) => setMetodePembayaran(e.target.value)} className="w-full p-2 border rounded-md text-black">
                    <option value="">Pilih metode pembayaran</option>
                    <option className="text-black" value="transfer">
                      Transfer Bank
                    </option>
                    <option className="text-black" value="cod">
                      Cash on Delivery
                    </option>
                  </select>
                </div>

                <div className="flex justify-between items-center">
                  <button type="submit" className="bg-blue-800 text-white px-6 py-2 rounded-md">
                    Selesaikan Pembelian
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Checkout;
