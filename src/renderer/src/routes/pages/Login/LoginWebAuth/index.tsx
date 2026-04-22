import { Button } from '@renderer/components/Button'

const IS_MAC = window.electron.process.platform === 'darwin'

export const LoginWebAuthTabContent = () => {
  const handleAuthenticate = async () => {
    if (IS_MAC) {
      const credential = await window.api.sendAsync('webAuth:createCredential', {
        displayName: 'Test da silva',
        name: 'Test',
        rpId: 'teressa-overjoyful-contently.ngrok-free.dev',
        userId: 'test',
      })

      console.log(credential)
    }

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(16),
        user: {
          id: new Uint8Array(16),
          name: 'Test',
          displayName: 'Test da silva',
        },
        rp: {
          name: 'Test',
        },
        pubKeyCredParams: [
          {
            type: 'public-key',
            alg: -7,
          },
        ],
      },
    })

    console.log(credential)
  }

  return <Button label="Authenticate" onClick={handleAuthenticate} />
}
