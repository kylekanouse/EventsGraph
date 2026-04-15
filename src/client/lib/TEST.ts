import { createOcean, Ocean, Uboot } from "@uboot/uboot"


const ocean: Ocean = createOcean()

// -- create
const boat1: Uboot = ocean.uboot('boat1', {})
const boat2: Uboot = ocean.uboot('boat2', {})
const boat3: Uboot = ocean.uboot('boat3', {})


// -- attach
boat1.radio('clicked').receive<string>((me: Uboot, sender: Uboot, msg: string) => {
  console.log(`Boat ${me.id} Received "${msg}" from Uboot "${sender.id}".`);
})

boat2.radio('clicked').receive<string>((me: Uboot, sender: Uboot, msg: string) => {
  console.log(`Boat ${me.id} Received "${msg}" from Uboot "${sender.id}".`);
})

boat3.radio('clicked').receive<string>((me: Uboot, sender: Uboot, msg: string) => {
  console.log(`Boat ${me.id} Received "${msg}" from Uboot "${sender.id}".`);
})


// -- send
boat2.radio('clicked').send('clicked message')