import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AppVentas() {

  const [productos, setProductos] = useState([
    { nombre: "Ceviche", precio: 50 },
    { nombre: "Arroz con mariscos", precio: 50 },
    { nombre: "Lasaña", precio: 45 },
  ]);

  const [metodosEntrega, setMetodosEntrega] = useState([
    "Delivery",
    "Recojo",
    "Oficina / Punto",
    "Colegio",
    "Zona / Vecino"
  ]);

  const datosIniciales = [
    { id:1,nombre:"Paola Torcuato",producto:"Arroz con mariscos",cantidad:3,entrega:"Delivery",direccion:"",pago:"Pendiente",entregado:false,fecha:new Date().toISOString()},
  ];

  const [ventas, setVentas] = useState(() => {
    const guardado = localStorage.getItem("ventas");
    if (!guardado) return datosIniciales;
    const parsed = JSON.parse(guardado);
    return parsed?.length ? parsed : datosIniciales;
  });

  useEffect(() => {
    localStorage.setItem("ventas", JSON.stringify(ventas));
  }, [ventas]);

  const getPrecio = (producto) => productos.find(p => p.nombre === producto)?.precio || 0;

  const totalVenta = (v) => v.cantidad * getPrecio(v.producto);

  const totalBolivianos = ventas.reduce((acc, v) => acc + totalVenta(v), 0);
  const totalPlatos = ventas.reduce((acc, v) => acc + Number(v.cantidad || 0), 0);
  const porEntregar = ventas.filter(v => !v.entregado).length;
  const porCobrar = ventas.filter(v => v.pago !== "Pagado").length;

  const actualizarVenta = (id, campo, valor) => {
    setVentas(ventas.map(v => v.id === id ? { ...v, [campo]: valor } : v));
  };

  const togglePago = (id) => {
    setVentas(ventas.map(v => v.id === id ? { ...v, pago: v.pago === "Pagado" ? "Pendiente" : "Pagado" } : v));
  };

  const toggleEntrega = (id) => {
    setVentas(ventas.map(v => v.id === id ? { ...v, entregado: !v.entregado } : v));
  };

  // 🗑️ ELIMINAR PEDIDO
  const eliminarVenta = (id) => {
    if (!confirm("¿Eliminar este pedido?")) return;
    setVentas(ventas.filter(v => v.id !== id));
  };

  // 🧹 ELIMINAR TODOS LOS ENTREGADOS
  const eliminarEntregados = () => {
    if (!confirm("¿Eliminar todos los pedidos entregados?")) return;
    setVentas(ventas.filter(v => !v.entregado));
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-[#f5efe6] min-h-screen">

      <h1 className="text-2xl font-bold mb-4 text-center text-red-800">
        Sistema de Pedidos Bolivia 🇧🇴
      </h1>

      {/* RESUMEN */}
      <Card className="mb-4 shadow-lg border border-yellow-700 bg-[#fff8e7]">
        <CardContent className="p-4 text-red-900 space-y-1">
          <p className="text-lg font-semibold">💰 Ventas totales: Bs {totalBolivianos}</p>
          <p>🍽️ Total de platos: {totalPlatos}</p>
          <p>🚚 Por entregar: {porEntregar}</p>
          <p>💵 Por cobrar: {porCobrar}</p>
          <Button onClick={eliminarEntregados} className="mt-2 bg-black text-white w-full">
            🧹 Limpiar entregados
          </Button>
        </CardContent>
      </Card>

      {/* FORMULARIO */}
      <Card className="mb-4 shadow-lg border border-yellow-700 bg-[#fff8e7]">
        <CardContent className="p-4 space-y-2 text-red-900">

          <div>
            <p className="text-xs">Nombre</p>
            <Input id="nuevoNombre" />
          </div>

          <div>
            <p className="text-xs">Producto</p>
            <input id="nuevoProducto" list="productosList" className="border p-2 rounded w-full" />
            <datalist id="productosList">
              {productos.map((p,i)=>(<option key={i} value={p.nombre} />))}
            </datalist>
          </div>

          <div>
            <p className="text-xs">Cantidad</p>
            <Input type="number" id="nuevaCantidad" />
          </div>

          <div>
            <p className="text-xs">Método de entrega</p>
            <input id="nuevoEntrega" list="entregasList" className="border p-2 rounded w-full" />
            <datalist id="entregasList">
              {metodosEntrega.map((m,i)=>(<option key={i} value={m} />))}
            </datalist>
          </div>

          <div>
            <p className="text-xs">Ubicación</p>
            <Input id="nuevaDireccion" />
          </div>

          <Button onClick={()=>{
            const nombre = document.getElementById('nuevoNombre').value;
            const producto = document.getElementById('nuevoProducto').value;
            const cantidad = document.getElementById('nuevaCantidad').value;
            const entrega = document.getElementById('nuevoEntrega').value;
            const direccion = document.getElementById('nuevaDireccion').value;

            if(!nombre || !cantidad) return;

            if(producto && !productos.find(p => p.nombre === producto)){
              setProductos([...productos, { nombre: producto, precio: 50 }]);
            }

            if(entrega && !metodosEntrega.includes(entrega)){
              setMetodosEntrega([...metodosEntrega, entrega]);
            }

            const nuevo = {
              id: Date.now(),
              nombre,
              producto,
              cantidad: Number(cantidad),
              entrega,
              direccion,
              pago: "Pendiente",
              entregado: false,
              fecha: new Date().toISOString()
            };

            setVentas([nuevo, ...ventas]);

            document.getElementById('nuevoNombre').value='';
            document.getElementById('nuevaCantidad').value='';
            document.getElementById('nuevaDireccion').value='';
          }}>
            Agregar Pedido
          </Button>

        </CardContent>
      </Card>

      {/* LISTA */}
      <div className="space-y-3">
        {ventas.map((venta) => (
          <Card key={venta.id} className="shadow-md border border-yellow-700 bg-[#fffaf0]">
            <CardContent className="p-4 flex justify-between gap-4">

              <div className="space-y-3 w-full">

                <div>
                  <p className="text-xs">Nombre</p>
                  <Input value={venta.nombre} onChange={(e)=>actualizarVenta(venta.id,"nombre",e.target.value)} />
                </div>

                <div>
                  <p className="text-xs">Producto</p>
                  <input value={venta.producto} list="productosList" onChange={(e)=>actualizarVenta(venta.id,"producto",e.target.value)} className="border p-2 rounded w-full" />
                </div>

                <div>
                  <p className="text-xs">Cantidad</p>
                  <Input type="number" value={venta.cantidad} onChange={(e)=>actualizarVenta(venta.id,"cantidad",e.target.value)} />
                </div>

                <div>
                  <p className="text-xs">Pago total</p>
                  <p className="font-semibold">Bs {totalVenta(venta)}</p>
                </div>

                <div>
                  <p className="text-xs">Método de entrega</p>
                  <input value={venta.entrega} list="entregasList" onChange={(e)=>actualizarVenta(venta.id,"entrega",e.target.value)} className="border p-2 rounded w-full" />
                </div>

                <div>
                  <p className="text-xs">Ubicación</p>
                  <Input value={venta.direccion} onChange={(e)=>actualizarVenta(venta.id,"direccion",e.target.value)} />
                </div>

              </div>

              <div className="flex flex-col gap-3 min-w-[120px]">
                <div>
                  <p className="text-xs">Pago</p>
                  <Button onClick={()=>togglePago(venta.id)} className={venta.pago === "Pagado" ? "bg-green-600 w-full text-white" : "bg-red-700 w-full text-white"}>
                    {venta.pago}
                  </Button>
                </div>

                <div>
                  <p className="text-xs">Entrega</p>
                  <Button onClick={()=>toggleEntrega(venta.id)} className={venta.entregado ? "bg-green-600 w-full text-white" : "bg-yellow-600 w-full text-white"}>
                    {venta.entregado?"Entregado":"Pendiente"}
                  </Button>
                </div>

                <div>
                  <p className="text-xs">Eliminar</p>
                  <Button onClick={()=>eliminarVenta(venta.id)} className="bg-black w-full text-white">
                    🗑️ Borrar
                  </Button>
                </div>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

    </div>
  );
}
