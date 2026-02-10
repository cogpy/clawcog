package ai.opencog.android.ui

import androidx.compose.runtime.Composable
import ai.opencog.android.MainViewModel
import ai.opencog.android.ui.chat.ChatSheetContent

@Composable
fun ChatSheet(viewModel: MainViewModel) {
  ChatSheetContent(viewModel = viewModel)
}
