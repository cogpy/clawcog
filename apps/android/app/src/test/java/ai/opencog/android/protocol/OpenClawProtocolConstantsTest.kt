package ai.opencog.android.protocol

import org.junit.Assert.assertEquals
import org.junit.Test

class OpenCogProtocolConstantsTest {
  @Test
  fun canvasCommandsUseStableStrings() {
    assertEquals("canvas.present", OpenCogCanvasCommand.Present.rawValue)
    assertEquals("canvas.hide", OpenCogCanvasCommand.Hide.rawValue)
    assertEquals("canvas.navigate", OpenCogCanvasCommand.Navigate.rawValue)
    assertEquals("canvas.eval", OpenCogCanvasCommand.Eval.rawValue)
    assertEquals("canvas.snapshot", OpenCogCanvasCommand.Snapshot.rawValue)
  }

  @Test
  fun a2uiCommandsUseStableStrings() {
    assertEquals("canvas.a2ui.push", OpenCogCanvasA2UICommand.Push.rawValue)
    assertEquals("canvas.a2ui.pushJSONL", OpenCogCanvasA2UICommand.PushJSONL.rawValue)
    assertEquals("canvas.a2ui.reset", OpenCogCanvasA2UICommand.Reset.rawValue)
  }

  @Test
  fun capabilitiesUseStableStrings() {
    assertEquals("canvas", OpenCogCapability.Canvas.rawValue)
    assertEquals("camera", OpenCogCapability.Camera.rawValue)
    assertEquals("screen", OpenCogCapability.Screen.rawValue)
    assertEquals("voiceWake", OpenCogCapability.VoiceWake.rawValue)
  }

  @Test
  fun screenCommandsUseStableStrings() {
    assertEquals("screen.record", OpenCogScreenCommand.Record.rawValue)
  }
}
