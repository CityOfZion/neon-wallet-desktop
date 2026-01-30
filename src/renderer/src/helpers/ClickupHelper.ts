import axios from 'axios'

import { SharedEnvHelper } from '@shared/helpers/SharedEnvHelper'
import { TClickupHelperCreateSupportTicketParams } from '@shared/types/helpers'

import { LoggerHelper } from './LoggerHelper'

export class ClickupHelper {
  static async createSupportTicket({ name, email, description }: TClickupHelperCreateSupportTicketParams) {
    if (
      !SharedEnvHelper.VITE_CLICK_UP_ASSIGNEE_ID ||
      !SharedEnvHelper.VITE_CLICK_UP_KEY ||
      !SharedEnvHelper.VITE_CLICK_UP_LIST_ID
    ) {
      LoggerHelper.warn('ClickupHelper: Missing ClickUp configuration. Skipping support ticket creation.', {
        where: 'ClickupHelper',
        operation: 'createSupportTicket',
      })
      return
    }

    const nameTrimmed = name.trim()
    const emailTrimmed = email.trim()
    const descriptionTrimmed = description.trim()

    const finalDescription = `- Name: ${nameTrimmed}
- Email: ${emailTrimmed}

- Description:

    ${descriptionTrimmed}`.trim()

    const normalPriority = 3

    await axios.post(
      `https://api.clickup.com/api/v2/list/${SharedEnvHelper.VITE_CLICK_UP_LIST_ID}/task`,
      {
        name: `NWD - Help - ${nameTrimmed}`,
        markdown_content: finalDescription,
        tags: ['ProductSupport'],
        status: 'development',
        priority: normalPriority,
        assignees: [SharedEnvHelper.VITE_CLICK_UP_ASSIGNEE_ID],
      },
      {
        headers: {
          Authorization: SharedEnvHelper.VITE_CLICK_UP_KEY,
        },
      }
    )
  }
}
