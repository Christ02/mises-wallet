

## Introducción a HayekCoin (HC)

**HayekCoin (HC)** es el token digital central de nuestro proyecto. Fue diseñado como un token **ERC-20** para garantizar la compatibilidad y la integración sencilla dentro del ecosistema Ethereum.

| Característica | Detalle |
| :--- | :--- |
| **Nombre de la Moneda** | HayekCoin |
| **Símbolo** | HC |
| **Estándar** | ERC-20 |
| **Red de Despliegue** | Testnet de Sepolia (Ethereum) |
| **Suministro Total Máximo** | $1.000.000.000.000$ HC (Mil billones) |
| **Mecanismo de Creación** | Premint (No se pueden crear más tokens) |
| **Característica Clave** | Implementación de **EIP-2612 (permit)** |
| **Equivalencia Fiduciaria** | **1 HC = 1 Quetzal (GTQ)** |

### Razón de la Paridad (1:1 con el Quetzal)

La elección de una paridad **1 HC = 1 Quetzal (GTQ)** se basa en la **facilidad de uso** para el usuario final. Al mantener una equivalencia simple con la moneda fiduciaria local, se **elimina la complejidad** de las tasas de conversión volátiles, haciendo que el proceso de compra, uso y entendimiento del valor del token sea **intuitivo** y familiar para cualquier persona que opere con Quetzales.

---

## Creación y Despliegue del Contrato Inteligente

### 1. El Banco Central como Contrato Inicial

El corazón de la HayekCoin es una billetera de Ethereum previamente creada que actúa como **el Banco Central (BC)** del proyecto. El contrato inteligente de HayekCoin fue **desplegado directamente hacia esta billetera**. Esto significa que al momento de la creación, la totalidad del suministro inicial fue asignada a la cuenta del BC.

* **Dirección del Banco Central (Contrato/Billetera):** `0x7226Cb2FA144Bfe0301a6b43196E721b59FaB7f1`

### 2. Uso de OpenZeppelin y Remix

El contrato inteligente ERC-20 de HayekCoin se construyó utilizando las librerías estándar y auditadas de **OpenZeppelin**.

> **OpenZeppelin** proporciona implementaciones seguras de estándares de Ethereum, lo que reduce significativamente el riesgo de vulnerabilidades.

El despliegue del contrato en la red de prueba de Sepolia se realizó utilizando la herramienta de desarrollo en línea **Remix IDE**.

### 3. Premint y Suministro Fijo

La HayekCoin fue creada con un mecanismo de **Premint**.

* Al momento del despliegue, se acuñó una cantidad inicial de **$1.000.000.000.000$ HC** (Mil billones).
* **Este es el suministro total y definitivo de la moneda.** El contrato fue diseñado de tal manera que **no es posible acuñar o crear Hayeks adicionales** después del *premint* inicial.
* Esto garantiza la **escasez** y la **naturaleza deflacionaria** de la moneda, ya que la oferta nunca aumentará.

### 4. La Importancia de `permit` (EIP-2612)

El contrato de HayekCoin fue implementado para utilizar la función **`permit`**, que se basa en la **EIP-2612**.

> **Definición de `permit`:** `permit` permite a los poseedores de tokens firmar un mensaje *off-chain* (fuera de la cadena de bloques) autorizando a un tercero a transferir una cantidad específica de sus tokens, y este tercero puede usar esa firma para ejecutar la transferencia *on-chain* (en la cadena).

#### Beneficio Clave: Transferencias sin Gas

El beneficio fundamental de `permit` es que **los poseedores de tokens pueden autorizar transferencias sin tener que pagar la tarifa de gas (ETH)**. La tarifa de gas es pagada por el tercero que ejecuta la transacción (el *spender*).

* **Para el usuario:** Mayor conveniencia y ahorro.
* **Para el proyecto:** Permite modelos de pago donde el comerciante o una entidad central paga el gas en nombre del usuario, mejorando significativamente la experiencia de usuario.

---

## Funcionamiento del Banco Central (BC)

### 1. Rol del Banco Central

El Banco Central (BC) en nuestro proyecto es la **billetera que posee la totalidad del suministro inicial de HayekCoin**.

* **Dirección:** `0x7226Cb2FA144Bfe0301a6b43196E721b59FaB7f1`

Su rol principal es ser el **único proveedor inicial de HayekCoin** al ecosistema.

### 2. Mecanismo de Distribución

El proceso de adquisición de HayekCoin por parte de los usuarios sigue este flujo:

1.  **Compra por parte del Usuario:** Un usuario decide adquirir HayekCoin utilizando Quetzales (GTQ) a la tasa de **1 GTQ = 1 HC**.
2.  **Adquisición del BC:** El sistema intermediario realiza la solicitud de compra al Banco Central.
3.  **Transferencia:** El Banco Central **transfiere** la cantidad solicitada de HayekCoin a la billetera del usuario.

**En resumen:** Los usuarios compran HayekCoin al Banco Central, y el BC actúa como el gran *pool* de liquidez inicial. A medida que los usuarios compran, la cantidad de HC en posesión del BC disminuye, y la cantidad en circulación aumenta.

---

## 🔗 Datos de Despliegue y Exploración

### 🔍 Explorador de Bloques (Sepolia Etherscan)

Todas las transacciones y la información del contrato de HayekCoin se pueden verificar en el explorador de bloques de Sepolia:

* **Dirección del Contrato de HayekCoin:** `0x7226Cb2FA144Bfe0301a6b43196E721b59FaB7f1`
* **Enlace de Transacciones:** https://sepolia.etherscan.io/address/0x7226cb2fa144bfe0301a6b43196e721b59fab7f1

### Metadatos del Despliegue

| Dato | Valor |
| :--- | :--- |
| **Dirección del Contrato** | `0x7226Cb2FA144Bfe0301a6b43196E721b59FaB7f1` |
| **Red de Prueba** | Sepolia |
| **Herramienta de Despliegue** | Remix IDE |
| **Librería Utilizada** | OpenZeppelin Contracts |
| **Función Clave** | EIP-2612 (permit) |

---

## Notas de Seguridad y Acceso (Solo para Desarrollo)

> **AVISO:** Las claves privadas son extremadamente sensibles y se incluyen aquí **únicamente con fines informativos para el equipo de desarrollo/auditoría.** **NUNCA** deben compartirse en entornos de producción o públicos.

* **API Key (Etherscan/Infura):** `98a6b9d7d4b84d5bbcdc57c490922e15`
* **Private Key (Banco Central/Deployer):** *\[Confidencial - Solo para uso interno y seguro\]*
* **Private API Key:** *\[Confidencial - Solo para uso interno y seguro\]*