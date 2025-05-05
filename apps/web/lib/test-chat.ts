/**
 * Test script for debugging chat streaming with a specific conversation ID
 *
 * Usage:
 * - Run this file with ts-node or similar
 * - Or copy/paste relevant parts into browser console
 */

import { createConversation, getConversation, getConversations, streamCompletion } from './api'

async function testGetOrCreateConversation() {
  try {
    let conversationId = ''
    const response = await getConversations()
    if (response.length === 0 || !response[0]) {
      const newConversation = await createConversation('Test Conversation')

      if (!newConversation) {
        throw new Error('Failed to create a new conversation')
      }

      conversationId = newConversation.id
    } else {
      conversationId = response[0].id
    }
    return conversationId
  } catch (error) {
    console.error('Error in testGetOrCreateConversation:', error)
    return null
  }
}

async function testConversationExists(conversationId: string | null) {
  try {
    if (!conversationId) {
      console.error('No conversation ID provided, cannot proceed with tests')
      return false
    }
    console.log(`Checking if conversation ${conversationId} exists...`)
    const conversation = await getConversation(conversationId)
    console.log('Conversation found:', conversation)
    return true
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return false
  }
}

async function testStreamingCompletion(conversationId: string | null) {
  try {
    if (!conversationId) {
      console.error('No conversation ID provided, cannot proceed with streaming test')
      return
    }
    console.log(`Testing streaming completion for conversation ${conversationId}`)

    // Start streaming and log the 10 first chunks received
    const chunkCount = 10
    let receivedChunks = 0
    await streamCompletion(conversationId, 'Hello', chunk => {
      if (receivedChunks < chunkCount) {
        console.log('Chunk received:', chunk)
        receivedChunks++
      }
      if (chunk.done) {
        console.log('Streaming completed for chunk:', chunk)
      }
    })

    console.log('Streaming completed successfully')
  } catch (error) {
    console.error('Streaming error:', error)
  }
}

// Run the tests
export async function runTests() {
  const conversationId = await testGetOrCreateConversation()
  const exists = await testConversationExists(conversationId)
  if (exists) {
    await testStreamingCompletion(conversationId)
  } else {
    console.log('Cannot test streaming as conversation does not exist')
  }
}
