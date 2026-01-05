import axios from 'axios'

import { TClickupHelperCreateSupportTicketParams } from '@shared/types/helpers'

export class ClickupHelper {
  static async createSupportTicket({ name, email, description }: TClickupHelperCreateSupportTicketParams) {
    const nameTrimmed = name.trim()
    const emailTrimmed = email.trim()
    const descriptionTrimmed = description.trim()

    if (!nameTrimmed || !emailTrimmed || !descriptionTrimmed) {
      throw new Error('All fields are required')
    }

    const finalDescription = `- Name: ${nameTrimmed}
- Email: ${emailTrimmed}

- Description:

    ${descriptionTrimmed}`.trim()

    const normalPriority = 3

    await axios.post(
      `https://api.clickup.com/api/v2/list/${import.meta.env.VITE_CLICK_UP_LIST_ID}/task`,
      {
        name: `NWD - Help - ${nameTrimmed}`,
        markdown_content: finalDescription,
        tags: ['ProductSupport'],
        status: 'to-do',
        priority: normalPriority,
        assignees: [import.meta.env.VITE_CLICK_UP_ASSIGNEE_ID],
      },
      {
        headers: {
          Authorization: import.meta.env.VITE_CLICK_UP_KEY,
        },
      }
    )
  }
}
