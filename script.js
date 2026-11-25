const $ = id => document.getElementById(id);
const texto = (id, valor, contenedor=id) => { $(id).textContent=valor||''; $(contenedor).hidden=!valor; };
function enlace(id, url){const el=$(id);el.hidden=!url;if(url)el.href=url;}
function https(url){try{const u=new URL(url);return u.protocol==='https:'?u.href:'';}catch{return '';}}
const escaparVCF = v => String(v||'').replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
async function iniciar(){
 const id=new URLSearchParams(location.search).get('id');
 const respuesta=await fetch('colaboradores.json');if(!respuesta.ok)throw Error('No se pudo cargar la información.');
 const datos=await respuesta.json();if(!id||!Object.hasOwn(datos,id))throw Error('Perfil no encontrado. Verifica el enlace de tu tarjeta.');
 const p=datos[id];document.title=p.nombre;
 const permitidos=['fondo-inicio','fondo-medio','fondo-final','texto','principal','texto-principal','secundario','fondo-habilidad','fondo-cierre','acento-cierre','texto-cierre'];
 for(const [k,v] of Object.entries(p.colores||{}))if(permitidos.includes(k)&&/^#[0-9a-f]{6}$/i.test(v))document.documentElement.style.setProperty('--'+k,v);
 texto('nombre',p.nombre);texto('puesto',p.puesto);texto('tagline',p.tagline);texto('sobre',p.sobre,'sobre-card');texto('hobby',p.hobby,'hobby-card');texto('frase',p.frase);texto('footer',`© ${new Date().getFullYear()} · ${p.nombre}.`);
 const foto=$('foto');foto.hidden=!p.foto;foto.alt=`Retrato de ${p.nombre}`;foto.onerror=()=>foto.hidden=true;if(p.foto)foto.src=p.foto;
 const tel=String(p.telefono||'').replace(/\D/g,'');const correo=p.correo||'';
 enlace('whatsapp',/^\d{8,15}$/.test(tel)?`https://wa.me/${tel}`:'');enlace('correo',correo?`mailto:${correo}`:'');enlace('linkedin',https(p.linkedin));enlace('red-linkedin',https(p.linkedin));enlace('instagram',https(p.instagram));
 const habilidades=p.habilidades||[];$('habilidades-card').hidden=!habilidades.length;
 for(const h of habilidades){const div=document.createElement('div');div.className='habilidad';const strong=document.createElement('strong');strong.textContent=h.titulo;div.append(strong,document.createTextNode(h.descripcion||''));$('habilidades').append(div);}
 const vcf=['BEGIN:VCARD','VERSION:3.0',`FN:${escaparVCF(p.nombre)}`,`N:${escaparVCF(p.nombre)};;;;`,...(tel?[`TEL;TYPE=CELL:+${tel}`]:[]),...(correo?[`EMAIL;TYPE=WORK:${escaparVCF(correo)}`]:[]),...(p.puesto?[`TITLE:${escaparVCF(p.puesto)}`]:[]),'END:VCARD',''].join('\r\n');
 $('contacto').href=URL.createObjectURL(new Blob([vcf],{type:'text/vcard;charset=utf-8'}));$('contacto').download=`contacto-${id}.vcf`;
 const url=new URL(location.pathname,location.origin);url.searchParams.set('id',id);
 try{new QRCode($('qr'),{text:url.href,width:192,height:192,correctLevel:QRCode.CorrectLevel.M});}catch{$('qr-error').hidden=false;}
 $('compartir').onclick=async()=>{try{if(navigator.share){await navigator.share({title:p.nombre,text:'Mi tarjeta de presentación digital',url:url.href});return;}}catch(e){if(e.name==='AbortError')return;}try{await navigator.clipboard.writeText(url.href);$('compartir').textContent='¡Enlace copiado!';}catch{window.prompt('Copia el enlace de mi perfil:',url.href);}};
 $('estado').hidden=true;$('perfil').hidden=false;
}
iniciar().catch(e=>{$('estado').textContent=e.message||'No se pudo abrir el perfil.';});
