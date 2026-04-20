import { Button } from '@renderer/components/Button'

export const LoginWebAuthTabContent = () => {
  const handleAuthenticate = async () => {
    await window.api.sendAsync('webAuth:createCredential', {
      displayName: 'Test da silva',
      name: 'Test',
      rpId: 'localhost',
      userId: 'test',
    })
  }

  return <Button label="Authenticate" onClick={handleAuthenticate} />
}
